package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/max_kai/military-grade-wg/internal/models"
)

// listNotifications returns all notifications for the current user
func (s *Server) listNotifications(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var notifications []models.Notification
	// Get user-specific notifications + broadcast notifications (user_id = 0)
	err := s.db.DB.Where("user_id = ? OR user_id = 0", userID).
		Order("created_at DESC").
		Limit(50).
		Find(&notifications).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	c.JSON(http.StatusOK, notifications)
}

// getUnreadCount returns the count of unread notifications
func (s *Server) getUnreadCount(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var count int64
	err := s.db.DB.Model(&models.Notification{}).
		Where("(user_id = ? OR user_id = 0) AND is_read = false", userID).
		Count(&count).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count notifications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

// markNotificationRead marks a notification as read
func (s *Server) markNotificationRead(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	id := c.Param("id")
	notifID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	// Verify notification belongs to user or is broadcast
	var notification models.Notification
	err = s.db.DB.Where("id = ? AND (user_id = ? OR user_id = 0)", notifID, userID).
		First(&notification).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	// Mark as read
	err = s.db.DB.Model(&notification).Update("is_read", true).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// deleteNotification deletes a notification
func (s *Server) deleteNotification(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	id := c.Param("id")
	notifID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	// Verify notification belongs to user or is broadcast
	var notification models.Notification
	err = s.db.DB.Where("id = ? AND (user_id = ? OR user_id = 0)", notifID, userID).
		First(&notification).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	// Delete notification
	err = s.db.DB.Delete(&notification).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}
