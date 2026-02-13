package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/max_kai/military-grade-wg/internal/models"
)

// listOrganizations returns all organizations
func (s *Server) listOrganizations(c *gin.Context) {
	var organizations []models.Organization

	// Get organization count with user stats
	type OrgWithStats struct {
		models.Organization
		UserCount int64 `json:"user_count"`
	}

	var orgsWithStats []OrgWithStats

	err := s.db.DB.Model(&models.Organization{}).Find(&organizations).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch organizations"})
		return
	}

	// Get user count for each organization
	for _, org := range organizations {
		var count int64
		s.db.DB.Model(&models.User{}).Where("organization_id = ?", org.ID).Count(&count)
		orgsWithStats = append(orgsWithStats, OrgWithStats{
			Organization: org,
			UserCount:    count,
		})
	}

	c.JSON(http.StatusOK, orgsWithStats)
}

// createOrganization creates a new organization
func (s *Server) createOrganization(c *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Organization name is required"})
		return
	}

	// Check if organization already exists
	var existing models.Organization
	if err := s.db.DB.Where("name = ?", input.Name).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Organization already exists"})
		return
	}

	organization := models.Organization{
		Name: input.Name,
	}

	if err := s.db.DB.Create(&organization).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organization"})
		return
	}

	// Log the action
	userID, _ := c.Get("userID")
	s.db.LogAction(userID.(uint), "CREATE_ORGANIZATION", organization.Name, "New organization created", c.ClientIP())

	c.JSON(http.StatusCreated, organization)
}

// getOrganization returns a specific organization
func (s *Server) getOrganization(c *gin.Context) {
	id := c.Param("id")
	orgID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	var organization models.Organization
	if err := s.db.DB.First(&organization, orgID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	// Get user count
	var userCount int64
	s.db.DB.Model(&models.User{}).Where("organization_id = ?", orgID).Count(&userCount)

	type OrgWithStats struct {
		models.Organization
		UserCount int64 `json:"user_count"`
	}

	result := OrgWithStats{
		Organization: organization,
		UserCount:    userCount,
	}

	c.JSON(http.StatusOK, result)
}

// updateOrganization updates an organization
func (s *Server) updateOrganization(c *gin.Context) {
	id := c.Param("id")
	orgID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	var organization models.Organization
	if err := s.db.DB.First(&organization, orgID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Organization name is required"})
		return
	}

	organization.Name = input.Name

	if err := s.db.DB.Save(&organization).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update organization"})
		return
	}

	// Log the action
	userID, _ := c.Get("userID")
	s.db.LogAction(userID.(uint), "UPDATE_ORGANIZATION", organization.Name, "Organization updated", c.ClientIP())

	c.JSON(http.StatusOK, organization)
}

// deleteOrganization deletes an organization
func (s *Server) deleteOrganization(c *gin.Context) {
	id := c.Param("id")
	orgID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	var organization models.Organization
	if err := s.db.DB.First(&organization, orgID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	// Check if organization has users
	var userCount int64
	s.db.DB.Model(&models.User{}).Where("organization_id = ?", orgID).Count(&userCount)
	if userCount > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete organization with existing users"})
		return
	}

	if err := s.db.DB.Delete(&organization).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete organization"})
		return
	}

	// Log the action
	userID, _ := c.Get("userID")
	s.db.LogAction(userID.(uint), "DELETE_ORGANIZATION", organization.Name, "Organization deleted", c.ClientIP())

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// getOrganizationUsers returns all users in an organization
func (s *Server) getOrganizationUsers(c *gin.Context) {
	id := c.Param("id")
	orgID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	var users []models.User
	if err := s.db.DB.Where("organization_id = ?", orgID).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, users)
}
