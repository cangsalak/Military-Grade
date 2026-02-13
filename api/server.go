package api

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/max_kai/military-grade-wg/internal"
	"github.com/max_kai/military-grade-wg/internal/models"
	"github.com/max_kai/military-grade-wg/internal/orchestrator"
	"github.com/skip2/go-qrcode"
	"go.uber.org/zap"
	"golang.zx2c4.com/wireguard/wgctrl/wgtypes"
)

type Server struct {
	router *gin.Engine
	wg     *internal.WGManager
	ipam   *internal.IPAM
	db     *internal.DBManager
	orch   *orchestrator.NodeOrchestrator
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func (s *Server) syncFirewall() {
	var rules []models.FirewallRule
	s.db.DB.Find(&rules)
	s.wg.SetFirewallRules(rules)
}

func (s *Server) startBackgroundTasks() {
	// 1. Operational Heartbeat (30s)
	heartbeat := time.NewTicker(30 * time.Second)
	// 2. Telemetry Collection (5m)
	metrics := time.NewTicker(5 * time.Minute)
	// 3. Strategic Data Pruning (24h)
	pruning := time.NewTicker(24 * time.Hour)
	// 4. Automated Key Rotation (30d)
	rotation := time.NewTicker(30 * 24 * time.Hour)

	go func() {
		for {
			select {
			case <-heartbeat.C:
				s.performHeartbeat()
			case <-metrics.C:
				s.collectMetrics()
			case <-pruning.C:
				s.db.PruneOldData()
			case <-rotation.C:
				zap.S().Info("AUTONOMOUS_SECURITY_ROUTINE: Initiating monthly cryptographic rotation.")
				s.performGlobalRotation()
			}
		}
	}()
}

func (s *Server) isCoreNode(node models.EdgeNode) bool {
	// Identify the manager node (core) by empty PublicIP or local identifier
	return node.PublicIP == "" || node.PublicIP == "127.0.0.1" || node.PublicIP == "localhost"
}

func (s *Server) calculateNodeHash(peers []models.Peer) string {
	b, _ := json.Marshal(peers)
	hash := sha256.Sum256(b)
	return hex.EncodeToString(hash[:])
}

func (s *Server) performHeartbeat() {
	var nodes []models.EdgeNode
	s.db.DB.Find(&nodes)

	for _, node := range nodes {
		if s.isCoreNode(node) {
			now := time.Now()
			s.db.DB.Model(&node).Updates(models.EdgeNode{Status: "online", LastSeen: &now})
			continue
		}

		statusRes, err := s.orch.GetNodeStatus(node)
		status := "offline"
		lastSeen := node.LastSeen

		if err == nil && statusRes.Online {
			status = "online"
			now := time.Now()
			lastSeen = &now

			// DETECT DRIFT: Compare Agent's reported hash with our DesiredHash
			if node.DesiredHash != "" && statusRes.LastSyncHash != node.DesiredHash {
				zap.S().Warnf("DRIFT_DETECTED on node %s! Agent: %s, Desired: %s. Initiating AUTO-REMEDY.", node.Name, statusRes.LastSyncHash, node.DesiredHash)

				// TRIGGER AUTO-REMEDY
				go func(target models.EdgeNode) {
					var targetPeers []models.Peer
					s.db.DB.Where("node_id = ?", target.ID).Find(&targetPeers)
					s.orch.SyncNodePeers(target, targetPeers)

					var rules []models.FirewallRule
					s.db.DB.Find(&rules)
					s.orch.SyncNodeFirewall(target, rules)

					zap.S().Infof("AUTO-REMEDY complete for node %s", target.Name)
				}(node)
			}
		}

		s.db.DB.Model(&node).Updates(models.EdgeNode{
			Status:       status,
			LastSeen:     lastSeen,
			LastSyncHash: statusRes.LastSyncHash,
		})
	}
}

func (s *Server) collectMetrics() {
	var nodes []models.EdgeNode
	s.db.DB.Where("is_active = ?", true).Find(&nodes)

	var allPeers []models.Peer
	s.db.DB.Find(&allPeers)

	// Map PublicKeys to Peer IDs for efficient lookup
	peerMap := make(map[string]models.Peer)
	for _, p := range allPeers {
		peerMap[p.PublicKey] = p
	}

	now := time.Now()
	for _, node := range nodes {
		var wgPeers []wgtypes.Peer
		var err error

		if s.isCoreNode(node) {
			wgPeers, err = s.wg.GetDevicePeers(node.InterfaceName)
		} else {
			var remotePeers []models.Peer
			remotePeers, err = s.orch.GetNodePeers(node)
			// Convert models.Peer to internal.WGPeer for uniform processing
			// Or just process them directly. Let's process them directly.
			for _, rp := range remotePeers {
				if dbPeer, ok := peerMap[rp.PublicKey]; ok {
					s.db.DB.Create(&models.PeerMetric{
						PeerID:    dbPeer.ID,
						NodeID:    node.ID,
						Timestamp: now,
						RxBytes:   rp.ReceiveBytes,
						TxBytes:   rp.TransmitBytes,
					})
				}
			}
			continue
		}

		if err != nil {
			zap.S().Errorf("Failed to harvest metrics from node %s: %v", node.Name, err)
			continue
		}

		// Process local core peers
		for _, wp := range wgPeers {
			pubKey := wp.PublicKey.String()
			if dbPeer, ok := peerMap[pubKey]; ok {
				s.db.DB.Create(&models.PeerMetric{
					PeerID:    dbPeer.ID,
					NodeID:    node.ID,
					Timestamp: now,
					RxBytes:   wp.ReceiveBytes,
					TxBytes:   wp.TransmitBytes,
				})
			}
		}
	}
}

func NewServer(wg *internal.WGManager, ipam *internal.IPAM, db *internal.DBManager) *Server {
	// Initialize Orchestrator for remote nodes
	token := os.Getenv("AGENT_TOKEN")
	if token == "" {
		token = "DEFAULT_INSECURE_AGENT_TOKEN_CHANGE_ME"
	}
	orch := orchestrator.NewNodeOrchestrator(token)

	s := &Server{
		router: gin.Default(),
		wg:     wg,
		ipam:   ipam,
		db:     db,
		orch:   orch,
	}
	s.router.Use(CORSMiddleware())
	s.setupRoutes()
	s.syncFirewall()
	s.startBackgroundTasks() // Launch high-fidelity background mission control
	return s
}

func (s *Server) setupRoutes() {
	// Health check (Public)
	s.router.GET("/health", func(c *gin.Context) {
		status, _ := s.wg.GetInterfaceStatus("wg0")
		c.JSON(http.StatusOK, gin.H{
			"status": "operational",
			"engine": "wireguard-v1",
			"wg0":    status,
		})
	})

	// Public Discovery & Setup
	s.router.GET("/api/v1/setup/status", s.handleSetupStatus)
	s.router.POST("/api/v1/setup/initialize", s.handleSetupInitialize)

	// Auth (Public)
	s.router.POST("/api/v1/auth/login", s.handleLogin)

	// Protected Routes
	v1 := s.router.Group("/api/v1")
	v1.Use(s.AuthMiddleware())
	{
		// 1. Operator/Staff Matrix (Manage Peers & Users)
		staff := v1.Group("")
		staff.Use(s.RoleMiddleware(models.RoleStaff, models.RoleAdmin, models.RoleRoot))
		{
			peers := staff.Group("/peers")
			{
				peers.GET("", s.listPeers)
				peers.POST("", s.createPeer)
				peers.PUT("/:id", s.updatePeer)
				peers.DELETE("/:id", s.RoleMiddleware(models.RoleAdmin, models.RoleRoot), s.deletePeer)
				peers.POST("/:id/revoke", s.revokePeer)
				peers.POST("/:id/rotate", s.rotatePeerKeys)
				peers.POST("/rotate-all", s.RoleMiddleware(models.RoleAdmin, models.RoleRoot), s.rotateAllKeys)
				peers.POST("/batch-migrate", s.batchMigratePeers)
			}

			users := staff.Group("/users")
			{
				users.GET("", s.listUsers)
				users.POST("", s.createUser)
				users.PATCH("/:id", s.updateUser)
				users.DELETE("/:id", s.RoleMiddleware(models.RoleAdmin, models.RoleRoot), s.deleteUser)
				users.GET("/:id/config", s.getUserConfig)
			}
		}

		// 2. Command Hub (Nodes & Policy) - Admin/Root Only
		admin := v1.Group("")
		admin.Use(s.RoleMiddleware(models.RoleAdmin, models.RoleRoot))
		{
			v1.GET("/audit-logs", s.getAuditLogs)
			v1.GET("/analytics", s.getGlobalAnalytics)
			v1.GET("/analytics/nodes", s.getNodeAnalytics)

			system := admin.Group("/system-config")
			{
				system.GET("", s.getSystemConfig)
				system.PATCH("", s.updateSystemConfig)
			}

			nodes := admin.Group("/nodes")
			{
				nodes.GET("", s.listNodes)
				nodes.POST("", s.createNode)
				nodes.PATCH("/:id", s.updateNode)
				nodes.DELETE("/:id", s.deleteNode)
				nodes.POST("/:id/sync", s.syncNode)
				nodes.GET("/:id/logs", s.handleNodeLogs)
			}

			firewall := admin.Group("/firewall")
			{
				firewall.GET("/rules", s.listFirewallRules)
				firewall.POST("/rules", s.addFirewallRule)
				firewall.DELETE("/rules/:id", s.deleteFirewallRule)
			}

			organizations := admin.Group("/organizations")
			{
				organizations.GET("", s.listOrganizations)
				organizations.POST("", s.createOrganization)
				organizations.GET("/:id", s.getOrganization)
				organizations.PATCH("/:id", s.updateOrganization)
				organizations.DELETE("/:id", s.deleteOrganization)
				organizations.GET("/:id/users", s.getOrganizationUsers)
			}
		}

		// 3. User Self-Service (Everyone authenticated can access their own)
		user := v1.Group("/user")
		{
			user.GET("/status", s.handleUserStatus)
			user.POST("/provision", s.handleUserProvision)
			user.POST("/regenerate", s.handleUserRegenerate)
			user.DELETE("/devices/:id", s.handleUserDeleteDevice)

			// Notifications
			notifications := user.Group("/notifications")
			{
				notifications.GET("", s.listNotifications)
				notifications.GET("/unread", s.getUnreadCount)
				notifications.POST("/:id/read", s.markNotificationRead)
				notifications.DELETE("/:id", s.deleteNotification)
			}
		}
	}
}

func (s *Server) handleSetupStatus(c *gin.Context) {
	var userCount int64
	s.db.DB.Model(&models.User{}).Count(&userCount)

	// Check interface status
	isActive, _ := s.wg.GetInterfaceStatus("wg0")

	c.JSON(http.StatusOK, gin.H{
		"initialized":      userCount > 0,
		"wireguard_active": isActive,
		"version":          "v1.2.0-MIL-SPEC",
	})
}

func (s *Server) handleLogin(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing credentials"})
		return
	}

	var user models.User
	if err := s.db.DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized Access Denied"})
		return
	}

	if !internal.CheckPasswordHash(input.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Cryptographic Token"})
		return
	}

	token, err := internal.GenerateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token Generation Failure"})
		return
	}

	s.db.LogAction(user.ID, "LOGIN", "SYSTEM", "", c.ClientIP())
	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}

func (s *Server) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || len(authHeader) < 8 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization Required"})
			c.Abort()
			return
		}

		tokenString := authHeader[7:] // Remove "Bearer "
		claims, err := internal.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Security Context"})
			c.Abort()
			return
		}

		// Store claims in context
		c.Set("userID", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func (s *Server) RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access Denied: Missing Role Identity"})
			c.Abort()
			return
		}

		userRole := role.(string)

		// ROOT bypasses all checks
		if userRole == models.RoleRoot {
			c.Next()
			return
		}

		for _, r := range allowedRoles {
			if r == userRole {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Access Denied: Insufficient Tactical Privilege"})
		c.Abort()
	}
}

func (s *Server) getAuditLogs(c *gin.Context) {
	logs := []models.AuditLog{}
	s.db.DB.Order("timestamp desc").Limit(50).Find(&logs)
	c.JSON(http.StatusOK, logs)
}

func (s *Server) listPeers(c *gin.Context) {
	peers := []models.Peer{}
	s.db.DB.Find(&peers)

	// Fetch live stats from kernel
	livePeers, err := s.wg.GetDevicePeers("wg0")
	if err == nil {
		statsMap := make(map[string]struct {
			rx int64
			tx int64
			lh time.Time
		})
		for _, lp := range livePeers {
			statsMap[lp.PublicKey.String()] = struct {
				rx int64
				tx int64
				lh time.Time
			}{
				rx: lp.ReceiveBytes,
				tx: lp.TransmitBytes,
				lh: lp.LastHandshakeTime,
			}
		}

		// Merge stats
		for i := range peers {
			if stats, ok := statsMap[peers[i].PublicKey]; ok {
				peers[i].ReceiveBytes = stats.rx
				peers[i].TransmitBytes = stats.tx
				peers[i].LastHandshake = stats.lh
			}
		}
	}

	c.JSON(http.StatusOK, peers)
}

func (s *Server) batchMigratePeers(c *gin.Context) {
	var input struct {
		PeerIDs      []uint `json:"peer_ids" binding:"required"`
		TargetNodeID uint   `json:"target_node_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Validate target node
	var targetNode models.EdgeNode
	if err := s.db.DB.First(&targetNode, input.TargetNodeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Target node not found in mission parameters"})
		return
	}

	// 2. Identify source nodes that will be affected (to remove peers from them)
	var peers []models.Peer
	s.db.DB.Where("id IN ?", input.PeerIDs).Find(&peers)

	affectedNodeIDs := make(map[uint]bool)
	for _, p := range peers {
		if p.NodeID != nil {
			affectedNodeIDs[*p.NodeID] = true
		}
	}
	affectedNodeIDs[input.TargetNodeID] = true

	// 3. Update DB Peer Node Assignments
	if err := s.db.DB.Model(&models.Peer{}).Where("id IN ?", input.PeerIDs).Update("node_id", input.TargetNodeID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to re-route peer identities"})
		return
	}

	// 4. Trigger Atomic Sync for all affected nodes in parallel
	for nodeID := range affectedNodeIDs {
		var node models.EdgeNode
		if err := s.db.DB.First(&node, nodeID).Error; err != nil {
			continue
		}

		go func(target models.EdgeNode) {
			var nodePeers []models.Peer
			s.db.DB.Where("node_id = ?", target.ID).Find(&nodePeers)

			if s.isCoreNode(target) {
				// Local Sync
				return
			}
			s.orch.SyncNodePeers(target, nodePeers)
		}(node)
	}

	s.db.LogAction(0, "BATCH_MIGRATE", fmt.Sprintf("%d PEERS", len(input.PeerIDs)), "NEW_BASE: "+targetNode.Name, c.ClientIP())
	c.JSON(http.StatusOK, gin.H{"status": "migration_deployed", "count": len(input.PeerIDs)})
}

func (s *Server) createPeer(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Get Authenticated User context
	userID, _ := c.Get("userID")
	uID := userID.(uint)

	// 2. Check if peer already exists for this username (if we want 1 peer per user)
	var existingPeer models.Peer
	if err := s.db.DB.Where("user_id = ? AND status = ?", uID, "active").First(&existingPeer).Error; err == nil {
		// Only one active peer per user for now in this enterprise policy
		// c.JSON(http.StatusConflict, gin.H{"error": "Security Constraint: Identity already provisioned"})
		// return
	}

	// 3. Generate Keypair
	priv, pub, err := s.wg.GenerateKeypair()
	if err != nil {
		internal.GetLogger().Error("Keygen failure", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cryptographic Engine Failure"})
		return
	}

	// 4. Allocate IP
	ip, err := s.ipam.Allocate()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "IPAM Pool Exhausted"})
		return
	}

	// 5. Save to DB
	peer := models.Peer{
		UserID:     uID, // Correctly link to the requester
		PublicKey:  pub,
		AssignedIP: ip,
		Status:     "active",
	}
	s.db.DB.Create(&peer)

	// 5. Sync to WG Interface
	if err := s.wg.SyncPeer("wg0", pub, []string{ip + "/32"}); err != nil {
		s.db.LogAction(0, "WG_SYNC_FAILED", pub, err.Error(), c.ClientIP())
	}

	serverPubKey, _ := s.wg.GetPublicKey("wg0")
	if serverPubKey == "" {
		serverPubKey = "SERVER_PUBKEY_UNAVAILABLE"
	}
	endpoint := os.Getenv("WG_ENDPOINT")
	if endpoint == "" {
		endpoint = "YOUR_SERVER_IP"
	}

	s.db.LogAction(uID, "CREATE_PEER", pub, "IP: "+ip, c.ClientIP())

	config := fmt.Sprintf(`[Interface]
PrivateKey = %s
Address = %s/32
DNS = 1.1.1.1

[Peer]
PublicKey = %s
Endpoint = %s:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`, priv, ip, serverPubKey, endpoint)

	c.JSON(http.StatusCreated, gin.H{
		"private_key": priv,
		"public_key":  pub,
		"assigned_ip": ip,
		"config":      config,
	})
}

func (s *Server) revokePeer(c *gin.Context) {
	peerID := c.Param("id")
	var peer models.Peer
	if err := s.db.DB.First(&peer, peerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Peer not found"})
		return
	}

	// ตัดการเชื่อมต่อทันที
	if err := s.wg.RevokePeer("wg0", peer.PublicKey, peer.AssignedIP); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Revocation failed"})
		return
	}

	// Update DB
	s.db.DB.Model(&peer).Update("status", "revoked")
	s.db.LogAction(0, "REVOKE_PEER", peer.PublicKey, "IP: "+peer.AssignedIP, c.ClientIP())

	c.JSON(http.StatusOK, gin.H{"status": "revoked"})
}

func (s *Server) updatePeer(c *gin.Context) {
	peerID := c.Param("id")
	var peer models.Peer
	if err := s.db.DB.First(&peer, peerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Peer not found"})
		return
	}

	var input struct {
		Username string `json:"username"`
		Status   string `json:"status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get authenticated user
	userID, _ := c.Get("userID")
	uID := userID.(uint)

	// Update allowed fields
	updates := make(map[string]interface{})
	if input.Username != "" {
		updates["username"] = input.Username
	}
	if input.Status != "" && (input.Status == "active" || input.Status == "revoked") {
		updates["status"] = input.Status
	}

	if len(updates) > 0 {
		s.db.DB.Model(&peer).Updates(updates)
		s.db.LogAction(uID, "UPDATE_PEER", peer.PublicKey, fmt.Sprintf("Updated: %v", updates), c.ClientIP())
	}

	c.JSON(http.StatusOK, peer)
}

func (s *Server) deletePeer(c *gin.Context) {
	peerID := c.Param("id")
	var peer models.Peer
	if err := s.db.DB.First(&peer, peerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Peer not found"})
		return
	}

	// Get authenticated user
	userID, _ := c.Get("userID")
	uID := userID.(uint)

	// 1. Remove from WireGuard kernel
	if err := s.wg.RevokePeer("wg0", peer.PublicKey, peer.AssignedIP); err != nil {
		internal.GetLogger().Error("Failed to remove peer from WG", zap.Error(err))
	}

	// 2. Release IP back to pool
	s.ipam.Release(peer.AssignedIP)

	// 3. Hard delete from database
	s.db.DB.Delete(&peer)
	s.db.LogAction(uID, "DELETE_PEER", peer.PublicKey, "IP: "+peer.AssignedIP+" (Hard Delete)", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{"status": "deleted", "message": "Peer permanently removed"})
}

func (s *Server) rotatePeerKeys(c *gin.Context) {
	peerID := c.Param("id")
	var peer models.Peer
	if err := s.db.DB.First(&peer, peerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Peer not found"})
		return
	}

	// 1. Remove old key from WG
	s.wg.RevokePeer("wg0", peer.PublicKey, peer.AssignedIP)

	// 2. Generate new keys
	priv, pub, err := s.wg.GenerateKeypair()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Keygen failed"})
		return
	}

	// 3. Update DB
	now := time.Now()
	peer.PublicKey = pub
	peer.RotatedAt = &now
	s.db.DB.Save(&peer)

	// 4. Sync new key to WG
	s.wg.SyncPeer("wg0", pub, []string{peer.AssignedIP + "/32"})

	// 5. Audit Log
	s.db.LogAction(0, "ROTATE_KEYS", pub, "Peer ID: "+peerID, c.ClientIP())

	// 6. Generate new config
	serverPubKey, _ := s.wg.GetPublicKey("wg0")
	endpoint := os.Getenv("WG_ENDPOINT")
	if endpoint == "" {
		endpoint = "YOUR_SERVER_IP"
	}

	config := fmt.Sprintf(`[Interface]
PrivateKey = %s
Address = %s/32
DNS = 1.1.1.1

[Peer]
PublicKey = %s
Endpoint = %s:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`, priv, peer.AssignedIP, serverPubKey, endpoint)

	c.JSON(http.StatusOK, gin.H{
		"private_key": priv,
		"public_key":  pub,
		"config":      config,
	})
}

func (s *Server) performGlobalRotation() int {
	var peers []models.Peer
	s.db.DB.Where("status = ?", "active").Find(&peers)

	rotatedCount := 0
	for _, peer := range peers {
		// 1. Remove old key
		s.wg.RevokePeer("wg0", peer.PublicKey, peer.AssignedIP)

		// 2. New keys
		_, pub, err := s.wg.GenerateKeypair()
		if err != nil {
			continue
		}

		// 3. Update DB
		now := time.Now()
		s.db.DB.Model(&peer).Updates(map[string]interface{}{
			"public_key": pub,
			"rotated_at": &now,
		})

		// 4. Sync new key
		s.wg.SyncPeer("wg0", pub, []string{peer.AssignedIP + "/32"})
		rotatedCount++
	}
	return rotatedCount
}

func (s *Server) rotateAllKeys(c *gin.Context) {
	rotatedCount := s.performGlobalRotation()
	s.db.LogAction(0, "ROTATE_ALL_KEYS", "PEERS_COUNT: "+fmt.Sprint(rotatedCount), "Manual strategic rotation trigger", c.ClientIP())
	c.JSON(http.StatusOK, gin.H{"status": "success", "rotated": rotatedCount})
}

func (s *Server) listFirewallRules(c *gin.Context) {
	rules := []models.FirewallRule{}
	s.db.DB.Find(&rules)
	c.JSON(http.StatusOK, rules)
}

func (s *Server) addFirewallRule(c *gin.Context) {
	var rule models.FirewallRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	s.db.DB.Create(&rule)
	s.db.LogAction(0, "ADD_FIREWALL_RULE", rule.Destination, rule.Action, c.ClientIP())
	s.syncFirewall()
	c.JSON(http.StatusCreated, rule)
}

func (s *Server) deleteFirewallRule(c *gin.Context) {
	id := c.Param("id")
	if err := s.db.DB.Delete(&models.FirewallRule{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete rule"})
		return
	}
	s.db.LogAction(0, "DELETE_FIREWALL_RULE", id, "", c.ClientIP())
	s.syncFirewall()
	c.JSON(http.StatusOK, gin.H{"status": "deleted"})
}

func (s *Server) getGlobalAnalytics(c *gin.Context) {
	var results []struct {
		Timestamp time.Time `json:"timestamp"`
		TotalRx   int64     `json:"total_rx"`
		TotalTx   int64     `json:"total_tx"`
	}

	// Aggregate metrics by hour for the last 24 hours
	s.db.DB.Model(&models.PeerMetric{}).
		Select("date_trunc('hour', timestamp) as timestamp, sum(rx_bytes) as total_rx, sum(tx_bytes) as total_tx").
		Where("timestamp > ?", time.Now().Add(-24*time.Hour)).
		Group("date_trunc('hour', timestamp)").
		Order("timestamp asc").
		Scan(&results)

	c.JSON(http.StatusOK, results)
}

func (s *Server) getNodeAnalytics(c *gin.Context) {
	var results []struct {
		NodeID   uint   `json:"node_id"`
		NodeName string `json:"node_name"`
		TotalRx  int64  `json:"total_rx"`
		TotalTx  int64  `json:"total_tx"`
	}

	s.db.DB.Table("peer_metrics").
		Select("node_id, nodes.name as node_name, sum(rx_bytes) as total_rx, sum(tx_bytes) as total_tx").
		Joins("left join nodes on nodes.id = peer_metrics.node_id").
		Group("node_id, nodes.name").
		Order("total_rx desc").
		Scan(&results)

	c.JSON(http.StatusOK, results)
}

func (s *Server) handleNodeLogs(c *gin.Context) {
	id := c.Param("id")
	var node models.EdgeNode
	if err := s.db.DB.First(&node, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Node not found in mission parameters"})
		return
	}

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")

	if s.isCoreNode(node) {
		// Stream local logs (Mock for now)
		ticker := time.NewTicker(2 * time.Second)
		defer ticker.Stop()
		c.Stream(func(w io.Writer) bool {
			select {
			case <-ticker.C:
				c.SSEvent("log", gin.H{
					"time":    time.Now().Format(time.RFC3339),
					"level":   "INFO",
					"message": "CORE MISSION CONTROL :: HEARTBEAT_OK",
					"node":    "CORE",
				})
				return true
			case <-c.Request.Context().Done():
				return false
			}
		})
		return
	}

	// Proxy remote node logs
	resp, err := s.orch.StreamNodeLogs(node)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to bridge node telemetry"})
		return
	}
	defer resp.Body.Close()

	// Use a scanner to read remote SSE events line by line and proxy them
	// For simplicity, we can also use io.Copy but SSE needs proper headers
	reader := bufio.NewReader(resp.Body)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			break
		}
		c.Writer.WriteString(line)
		c.Writer.Flush()

		select {
		case <-c.Request.Context().Done():
			return
		default:
		}
	}
}

func (s *Server) handleUserStatus(c *gin.Context) {
	uID, _ := c.Get("userID")
	userID := uID.(uint)

	var peers []models.Peer
	s.db.DB.Where("user_id = ?", userID).Find(&peers)

	// Fill realtime stats
	wgPeers, _ := s.wg.GetDevicePeers("wg0")
	peerStats := make(map[string]struct {
		RX int64
		TX int64
		LH time.Time
	})
	for _, p := range wgPeers {
		peerStats[p.PublicKey.String()] = struct {
			RX int64
			TX int64
			LH time.Time
		}{p.ReceiveBytes, p.TransmitBytes, p.LastHandshakeTime}
	}

	for i := range peers {
		if stat, ok := peerStats[peers[i].PublicKey]; ok {
			peers[i].ReceiveBytes = stat.RX
			peers[i].TransmitBytes = stat.TX
			peers[i].LastHandshake = stat.LH
		}
	}
	c.JSON(http.StatusOK, peers)
}

func (s *Server) handleUserProvision(c *gin.Context) {
	uID, _ := c.Get("userID")
	userID := uID.(uint)

	// Policy: Up to 5 active devices per user
	var count int64
	s.db.DB.Model(&models.Peer{}).Where("user_id = ? AND status = ?", userID, "active").Count(&count)
	if count >= 5 {
		c.JSON(http.StatusConflict, gin.H{"error": "Maximum device limit (5) reached. Please forget an old device first."})
		return
	}

	// 1. Generate keys (RAM ONLY)
	priv, pub, err := s.wg.GenerateKeypair()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Key generation failed"})
		return
	}

	// 2. Allocate IP
	ip, err := s.ipam.Allocate()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "IPAM pool exhausted"})
		return
	}

	// 3. Save Public Key to DB
	peer := models.Peer{
		UserID:        userID,
		PublicKey:     pub,
		AssignedIP:    ip,
		Status:        "active",
		IsProvisioned: true,
	}
	s.db.DB.Create(&peer)

	// 4. Sync to Kernel
	s.wg.SyncPeer("wg0", pub, []string{ip + "/32"})
	s.db.LogAction(userID, "USER_PROVISION", pub, "Self-provisioning completed", c.ClientIP())

	// 5. Generate Config
	serverPubKey, _ := s.wg.GetPublicKey("wg0")
	endpoint := os.Getenv("WG_ENDPOINT")
	if endpoint == "" {
		endpoint = "127.0.0.1" // Fallback
	}

	config := fmt.Sprintf(`[Interface]
PrivateKey = %s
Address = %s/32
DNS = 1.1.1.1

[Peer]
PublicKey = %s
Endpoint = %s:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`, priv, ip, serverPubKey, endpoint)

	// 6. Generate QR Code
	png, _ := qrcode.Encode(config, qrcode.Medium, 256)

	c.JSON(http.StatusOK, gin.H{
		"config": config,
		"qr":     png,
	})
}

func (s *Server) handleUserRegenerate(c *gin.Context) {
	uID, _ := c.Get("userID")
	userID := uID.(uint)

	// 1. Revoke existing
	var peers []models.Peer
	s.db.DB.Where("user_id = ? AND status = ?", userID, "active").Find(&peers)
	for _, p := range peers {
		s.wg.RevokePeer("wg0", p.PublicKey, p.AssignedIP)
		s.ipam.Release(p.AssignedIP)
		s.db.DB.Model(&p).Update("status", "revoked")
		s.db.LogAction(userID, "USER_REGENERATE_REVOKE", p.PublicKey, "Automatic revocation", c.ClientIP())
	}

	// 2. Provision new
	s.handleUserProvision(c)
}

func (s *Server) handleUserDeleteDevice(c *gin.Context) {
	uID, _ := c.Get("userID")
	userID := uID.(uint)
	peerID := c.Param("id")

	var peer models.Peer
	if err := s.db.DB.Where("id = ? AND user_id = ?", peerID, userID).First(&peer).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Device identity not found"})
		return
	}

	// 1. Hardware Revocation
	s.wg.RevokePeer("wg0", peer.PublicKey, peer.AssignedIP)

	// 2. IPAM Release
	s.ipam.Release(peer.AssignedIP)

	// 3. Permanent Removal (Forgot)
	s.db.DB.Delete(&peer)

	s.db.LogAction(userID, "USER_FORGET_DEVICE", peer.PublicKey, "Device identity permanently removed by owner", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{"status": "forgotten", "message": "Device access removed successfully"})
}

// --- Multi-Gateway Node Management ---

func (s *Server) listNodes(c *gin.Context) {
	var nodes []models.EdgeNode
	if err := s.db.DB.Find(&nodes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch nodes"})
		return
	}
	c.JSON(http.StatusOK, nodes)
}

func (s *Server) createNode(c *gin.Context) {
	var node models.EdgeNode
	if err := c.ShouldBindJSON(&node); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Strategic Subnet Conflict Check
	var existingNodes []models.EdgeNode
	s.db.DB.Find(&existingNodes)
	for _, existing := range existingNodes {
		if s.checkSubnetOverlap(node.TunnelSubnet, existing.TunnelSubnet) {
			c.JSON(http.StatusConflict, gin.H{"error": fmt.Sprintf("Tunnel subnet conflict with existing node: %s", existing.Name)})
			return
		}
	}

	if err := s.db.DB.Create(&node).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create node"})
		return
	}

	s.db.LogAction(0, "CREATE_NODE", node.Name, "New gateway node deployed via UI", c.ClientIP())
	c.JSON(http.StatusCreated, node)
}

func (s *Server) checkSubnetOverlap(cidr1, cidr2 string) bool {
	_, net1, err1 := net.ParseCIDR(cidr1)
	_, net2, err2 := net.ParseCIDR(cidr2)
	if err1 != nil || err2 != nil {
		return false
	}
	return net1.Contains(net2.IP) || net2.Contains(net1.IP)
}

func (s *Server) updateNode(c *gin.Context) {
	id := c.Param("id")
	var node models.EdgeNode
	if err := s.db.DB.First(&node, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Node not found"})
		return
	}

	var updateData models.EdgeNode
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	s.db.DB.Model(&node).Updates(updateData)
	s.db.LogAction(0, "UPDATE_NODE", node.Name, "Gateway parameters re-calibrated via UI", c.ClientIP())
	c.JSON(http.StatusOK, node)
}

func (s *Server) deleteNode(c *gin.Context) {
	id := c.Param("id")
	if err := s.db.DB.Delete(&models.EdgeNode{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decommission node"})
		return
	}
	s.db.LogAction(0, "DELETE_NODE", id, "Gateway node permanently removed from matrix", c.ClientIP())
	c.JSON(http.StatusOK, gin.H{"message": "Node decommissioned successfully"})
}

func (s *Server) syncNode(c *gin.Context) {
	id := c.Param("id")
	var node models.EdgeNode
	if err := s.db.DB.First(&node, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Node not found"})
		return
	}

	// 1. Fetch all peers assigned to this node
	var peers []models.Peer
	s.db.DB.Where("node_id = ?", node.ID).Find(&peers)

	// 2. Trigger Orchestrator Sync
	if err := s.orch.SyncNodePeers(node, peers); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": fmt.Sprintf("Node sync failed: %v", err)})
		return
	}

	// 3. Sync Firewall rules to the node
	var rules []models.FirewallRule
	s.db.DB.Find(&rules)
	if err := s.orch.SyncNodeFirewall(node, rules); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": fmt.Sprintf("Firewall sync failed: %v", err)})
		return
	}

	// 4. Update Desired Hash for Drift Detection
	desiredHash := s.calculateNodeHash(peers)
	s.db.DB.Model(&node).Update("desired_hash", desiredHash)

	s.db.LogAction(0, "SYNC_NODE", node.Name, "Full configuration matrix pushed to node", c.ClientIP())
	c.JSON(http.StatusOK, gin.H{"status": "synchronized", "peer_count": len(peers), "hash": desiredHash})
}

func (s *Server) listUsers(c *gin.Context) {
	var users []models.User
	if err := s.db.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to catalog identities"})
		return
	}

	// Dynamic hydration of usage vectors
	type userWithStats struct {
		models.User
		RxBytes       int64      `json:"rx_bytes"`
		TxBytes       int64      `json:"tx_bytes"`
		LastHandshake *time.Time `json:"last_handshake"`
	}

	enriched := make([]userWithStats, len(users))
	for i, u := range users {
		var peer models.Peer
		s.db.DB.Where("user_id = ? AND status = ?", u.ID, "active").Order("created_at desc").First(&peer)

		enriched[i] = userWithStats{
			User: u,
		}

		if peer.ID != 0 {
			// Pull latest metrics from telemetry data
			var metric models.PeerMetric
			s.db.DB.Where("peer_id = ?", peer.ID).Order("timestamp desc").First(&metric)
			enriched[i].RxBytes = metric.RxBytes
			enriched[i].TxBytes = metric.TxBytes
			if !peer.LastHandshake.IsZero() {
				ts := peer.LastHandshake
				enriched[i].LastHandshake = &ts
			}
		}
	}

	c.JSON(http.StatusOK, enriched)
}

func (s *Server) getUserConfig(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := s.db.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Identity not found"})
		return
	}

	// 1. Locate or Initialize Peer Identity
	var peer models.Peer
	if err := s.db.DB.Where("user_id = ? AND status = ?", user.ID, "active").First(&peer).Error; err != nil {
		// Auto-provision if missing
		ip, _ := s.ipam.Allocate()
		peer = models.Peer{
			UserID:     user.ID,
			AssignedIP: ip,
			Status:     "active",
		}
	}

	// 2. Perform Key Rotation (RAM ONLY)
	priv, pub, err := s.wg.GenerateKeypair()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Flash key generation failed"})
		return
	}

	// 3. Update Matrix Commit
	peer.PublicKey = pub
	if peer.ID == 0 {
		s.db.DB.Create(&peer)
	} else {
		s.db.DB.Save(&peer)
	}

	// 4. Hot-Sync to Kernel
	s.wg.SyncPeer("wg0", pub, []string{peer.AssignedIP + "/32"})

	// 5. Build Final Payload
	serverPubKey, err := s.wg.GetPublicKey("wg0")
	if err != nil || strings.Contains(serverPubKey, "SERVER_MODE_PUBKEY") {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Primary Node (wg0) is not yet active. Please register your Primary Node first."})
		return
	}

	endpoint := os.Getenv("WG_ENDPOINT")
	if endpoint == "" {
		// Attempt to use the host from the request if it's an IP
		host := c.Request.Host
		if strings.Contains(host, ":") {
			host, _, _ = net.SplitHostPort(host)
		}
		endpoint = host
	}

	config := fmt.Sprintf(`[Interface]
PrivateKey = %s
Address = %s/32
DNS = 1.1.1.1

[Peer]
PublicKey = %s
Endpoint = %s:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`, priv, peer.AssignedIP, serverPubKey, endpoint)

	s.db.LogAction(0, "GENERATE_CONFIG", user.Username, "Configuration vector exported with key rotation", c.ClientIP())
	c.String(http.StatusOK, config)
}

func (s *Server) createUser(c *gin.Context) {
	var input struct {
		OrganizationID uint   `json:"organization_id"`
		Username       string `json:"username" binding:"required"`
		Email          string `json:"email" binding:"required"`
		Name           string `json:"name"`
		Password       string `json:"password" binding:"required"`
		PIN            string `json:"pin"`
		Role           string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hash, _ := internal.HashPassword(input.Password)
	user := models.User{
		OrganizationID: input.OrganizationID,
		Username:       input.Username,
		Email:          input.Email,
		Name:           input.Name,
		PIN:            input.PIN,
		PasswordHash:   hash,
		Role:           input.Role,
		Status:         "active",
	}

	if err := s.db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username or email already exists"})
		return
	}

	s.db.LogAction(0, "CREATE_USER", user.Username, "New identity vector initialized", c.ClientIP())
	c.JSON(http.StatusCreated, user)
}

func (s *Server) updateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := s.db.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User identity not found"})
		return
	}

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Handle password update via hash if present
	if pwd, ok := updateData["password"].(string); ok && pwd != "" {
		hash, _ := internal.HashPassword(pwd)
		updateData["password_hash"] = hash
		delete(updateData, "password")
	}

	if err := s.db.DB.Model(&user).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to recalibrate identity"})
		return
	}

	s.db.LogAction(0, "UPDATE_USER", user.Username, "Identity parameters updated", c.ClientIP())
	c.JSON(http.StatusOK, user)
}

func (s *Server) deleteUser(c *gin.Context) {
	id := c.Param("id")
	if err := s.db.DB.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to purge identity"})
		return
	}
	s.db.LogAction(0, "DELETE_USER", id, "Identity vector permanently removed", c.ClientIP())
	c.JSON(http.StatusOK, gin.H{"message": "Identity purged from matrix"})
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}
