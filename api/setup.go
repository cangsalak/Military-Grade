package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/max_kai/military-grade-wg/internal"
	"github.com/max_kai/military-grade-wg/internal/models"
	"go.uber.org/zap"
)

type SetupInitRequest struct {
	OrgName        string `json:"org_name" binding:"required"`
	OrgDescription string `json:"org_description"`
	AdminUsername  string `json:"admin_username" binding:"required"`
	AdminEmail     string `json:"admin_email" binding:"required"`
	AdminPassword  string `json:"admin_password" binding:"required"`
}

func (s *Server) handleSetupInitialize(c *gin.Context) {
	var userCount int64
	s.db.DB.Model(&models.User{}).Count(&userCount)

	if userCount > 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "SYSTEM_ALREADY_INITIALIZED: Manual genesis forbidden."})
		return
	}

	var req SetupInitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Begin Atomic Genesis
	tx := s.db.DB.Begin()

	// 1. Create Organization
	org := models.Organization{
		Name:        req.OrgName,
		Description: req.OrgDescription,
	}
	if err := tx.Create(&org).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Genesis Error: Organization formation failed."})
		return
	}

	// 2. Create Root Admin
	hash, _ := internal.HashPassword(req.AdminPassword)
	admin := models.User{
		Username:       req.AdminUsername,
		Email:          req.AdminEmail,
		PasswordHash:   hash,
		Role:           models.RoleRoot,
		OrganizationID: org.ID,
		Status:         "active",
	}
	if err := tx.Create(&admin).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Genesis Error: Administrative identity deployment failed."})
		return
	}

	tx.Commit()

	zap.S().Infof("GENESIS_SUCCESS: Organization '%s' established by '%s'", org.Name, admin.Username)
	s.db.LogAction(admin.ID, "GENESIS_INITIALIZATION", org.Name, "System initialized via Web Wizard", c.ClientIP())

	c.JSON(http.StatusCreated, gin.H{
		"status":   "initialized",
		"message":  "Strategic Matrix established. Mission ready.",
		"admin_id": admin.ID,
		"org_id":   org.ID,
	})
}
