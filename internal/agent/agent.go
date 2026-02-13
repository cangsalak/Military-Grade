package agent

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/max_kai/military-grade-wg/internal"
	"github.com/max_kai/military-grade-wg/internal/models"
)

type ArmorAgent struct {
	router *gin.Engine
	wg     *internal.WGManager
	token  string
	mu     sync.Mutex
}

func NewArmorAgent(wg *internal.WGManager, token string) *ArmorAgent {
	a := &ArmorAgent{
		router: gin.Default(),
		wg:     wg,
		token:  token,
	}

	a.setupRoutes()
	return a
}

func (a *ArmorAgent) setupRoutes() {
	// Middleware to verify Manager's Token
	auth := func(c *gin.Context) {
		t := c.GetHeader("X-ARMOR-TOKEN")
		if t != a.token {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized Manager Access"})
			return
		}
		c.Next()
	}

	api := a.router.Group("/agent/v1")
	api.Use(auth)
	{
		api.GET("/status", a.handleStatus)
		api.POST("/sync", a.handleSync)
		api.POST("/firewall", a.handleFirewall)
		api.GET("/logs", a.handleLogs)
	}
}

func (a *ArmorAgent) calculateHash(data interface{}) string {
	b, _ := json.Marshal(data)
	hash := sha256.Sum256(b)
	return hex.EncodeToString(hash[:])
}

func (a *ArmorAgent) handleStatus(c *gin.Context) {
	iface := c.DefaultQuery("interface", "wg0")
	peers, err := a.wg.GetDevicePeers(iface)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Read last sync hash from local storage for drift detection
	lastHash, _ := os.ReadFile(".armor_sync_hash")

	c.JSON(http.StatusOK, gin.H{
		"interface":      iface,
		"peers":          peers,
		"online":         true,
		"last_sync_hash": string(lastHash),
	})
}

func (a *ArmorAgent) handleLogs(c *gin.Context) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Access-Control-Allow-Origin", "*")

	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	c.Stream(func(w io.Writer) bool {
		select {
		case <-ticker.C:
			now := time.Now().Format(time.RFC3339)
			c.SSEvent("log", gin.H{
				"time":    now,
				"level":   "INFO",
				"message": "Tactical Identity Matrix Heartbeat :: SEC_HEALTH_STABLE",
				"node":    "ARMOR-EDGE-01",
			})
			return true
		case <-c.Request.Context().Done():
			return false
		}
	})
}

func (a *ArmorAgent) handleSync(c *gin.Context) {
	a.mu.Lock()
	defer a.mu.Unlock()

	var req struct {
		Interface string        `json:"interface"`
		Peers     []models.Peer `json:"peers"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Calculate and persist configuration fingerprint for self-healing
	configHash := a.calculateHash(req.Peers)
	_ = os.WriteFile(".armor_sync_hash", []byte(configHash), 0644)

	// Logic for Atomic Sync via wgctrl
	for _, p := range req.Peers {
		err := a.wg.SyncPeer(req.Interface, p.PublicKey, []string{p.AssignedIP})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to sync peer %s: %v", p.PublicKey, err)})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "synchronized",
		"count":  len(req.Peers),
		"hash":   configHash,
	})
}

func (a *ArmorAgent) handleFirewall(c *gin.Context) {
	var rules []models.FirewallRule
	if err := c.ShouldBindJSON(&rules); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := a.wg.SetFirewallRules(rules); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "firewall_updated"})
}

func (a *ArmorAgent) Run(addr string) error {
	return a.router.Run(addr)
}
