package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/max_kai/military-grade-wg/internal/models"
	"go.uber.org/zap"
)

func (s *Server) getSystemConfig(c *gin.Context) {
	var config models.SystemConfig
	if err := s.db.DB.First(&config).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve global matrix configuration."})
		return
	}
	c.JSON(http.StatusOK, config)
}

func (s *Server) updateSystemConfig(c *gin.Context) {
	var config models.SystemConfig
	if err := s.db.DB.First(&config).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve global matrix configuration."})
		return
	}

	var input struct {
		MatrixName            string `json:"matrix_name"`
		SupportEmail          string `json:"support_email"`
		PublicGatewayIP       string `json:"public_gateway_ip"`
		InternalSubnet        string `json:"internal_subnet"`
		DNSFilteringActive    *bool  `json:"dns_filtering_active"`
		PiHoleAddress         string `json:"pihole_address"`
		StealthAPNActive      *bool  `json:"stealth_apn_active"`
		StealthAPNHost        string `json:"stealth_apn_host"`
		InternetAccessLimited *bool  `json:"internet_access_limited"`
		WANInterface          string `json:"wan_interface"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.MatrixName != "" {
		config.MatrixName = input.MatrixName
	}
	if input.SupportEmail != "" {
		config.SupportEmail = input.SupportEmail
	}
	if input.PublicGatewayIP != "" {
		config.PublicGatewayIP = input.PublicGatewayIP
	}
	if input.InternalSubnet != "" {
		config.InternalSubnet = input.InternalSubnet
	}
	if input.DNSFilteringActive != nil {
		config.DNSFilteringActive = *input.DNSFilteringActive
	}
	if input.PiHoleAddress != "" {
		config.PiHoleAddress = input.PiHoleAddress
	}
	if input.StealthAPNActive != nil {
		config.StealthAPNActive = *input.StealthAPNActive
	}
	if input.StealthAPNHost != "" {
		config.StealthAPNHost = input.StealthAPNHost
	}
	if input.InternetAccessLimited != nil {
		config.InternetAccessLimited = *input.InternetAccessLimited
	}
	if input.WANInterface != "" {
		config.WANInterface = input.WANInterface
	}

	if err := s.db.DB.Save(&config).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to synchronize matrix parameters."})
		return
	}

	// Apply change to Host
	if err := s.wg.ApplySystemConfig(config); err != nil {
		zap.S().Errorf("Failed to apply system config to host: %v", err)
		// We don't return error here because the DB update was successful,
		// but we should notify that the local apply failed (e.g. if in DevMode)
	}

	// Log Action
	userID, _ := c.Get("userID")
	s.db.LogAction(userID.(uint), "UPDATE_SYSTEM_CONFIG", "GLOBAL", "Global parameters modified", c.ClientIP())

	c.JSON(http.StatusOK, config)
}
