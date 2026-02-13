package internal

import (
	"fmt"
	"time"

	"github.com/max_kai/military-grade-wg/internal/models"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type DBManager struct {
	DB *gorm.DB
}

func NewDBManager(dsn string) (*DBManager, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt: true, // Cache prepared statements for speed
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	sqlDB, _ := db.DB()
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Auto-migrate the schema
	err = db.AutoMigrate(&models.Organization{}, &models.User{}, &models.EdgeNode{}, &models.Peer{}, &models.AuditLog{}, &models.FirewallRule{}, &models.PeerMetric{}, &models.Notification{}, &models.SystemConfig{})
	if err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	return &DBManager{DB: db}, nil
}

func (m *DBManager) SeedAdmin() {
	// Global System Configuration
	var configCount int64
	m.DB.Model(&models.SystemConfig{}).Count(&configCount)
	if configCount == 0 {
		config := models.SystemConfig{
			DNSFilteringActive: false,
			PiHoleAddress:      "127.0.0.1",
			StealthAPNActive:   false,
			WANInterface:       "eth0",
		}
		m.DB.Create(&config)
		GetLogger().Info("System default configuration initialized")
	}

	// ROOT User (Full System Access)
	var rootCount int64
	m.DB.Model(&models.User{}).Where("username = ?", "admin").Count(&rootCount)
	if rootCount == 0 {
		hashRoot, _ := HashPassword("admin123")
		root := models.User{
			Username:     "admin",
			Email:        "admin@armor-x1.local",
			PasswordHash: hashRoot,
			Role:         models.RoleRoot,
			Status:       "active",
		}
		m.DB.Create(&root)
		GetLogger().Info("Default ROOT user created", zap.String("username", "admin"))
	}

	// ADMIN User (Gateway & Policy Management)
	var adminCount int64
	m.DB.Model(&models.User{}).Where("username = ?", "commander").Count(&adminCount)
	if adminCount == 0 {
		hashAdmin, _ := HashPassword("admin123")
		admin := models.User{
			Username:     "commander",
			Email:        "commander@armor-x1.local",
			PasswordHash: hashAdmin,
			Role:         models.RoleAdmin,
			Status:       "active",
		}
		m.DB.Create(&admin)
		GetLogger().Info("ADMIN user created", zap.String("username", "commander"))
	}

	// STAFF User (Peer Management)
	var staffCount int64
	m.DB.Model(&models.User{}).Where("username = ?", "operator").Count(&staffCount)
	if staffCount == 0 {
		hashStaff, _ := HashPassword("staff123")
		staff := models.User{
			Username:     "operator",
			Email:        "operator@armor-x1.local",
			PasswordHash: hashStaff,
			Role:         models.RoleStaff,
			Status:       "active",
		}
		m.DB.Create(&staff)
		GetLogger().Info("STAFF user created", zap.String("username", "operator"))
	}

	// REGULAR User (View Only)
	var userCount int64
	m.DB.Model(&models.User{}).Where("username = ?", "viewer").Count(&userCount)
	if userCount == 0 {
		hashUser, _ := HashPassword("user123")
		user := models.User{
			Username:     "viewer",
			Email:        "viewer@armor-x1.local",
			PasswordHash: hashUser,
			Role:         models.RoleUser,
			Status:       "active",
		}
		m.DB.Create(&user)
		GetLogger().Info("USER created", zap.String("username", "viewer"))
	}
}

func (m *DBManager) LogAction(actorID uint, action, resourceID, payload, sourceIP string) {
	logEntry := models.AuditLog{
		ActorID:    actorID,
		Action:     action,
		ResourceID: resourceID,
		Payload:    payload,
		SourceIP:   sourceIP,
	}
	m.DB.Create(&logEntry)
}

func (m *DBManager) PruneOldData() {
	retentionPeriod := 7 * 24 * time.Hour
	cutoff := time.Now().Add(-retentionPeriod)

	// Prune telemetry metrics
	resMetrics := m.DB.Unscoped().Where("timestamp < ?", cutoff).Delete(&models.PeerMetric{})
	if resMetrics.RowsAffected > 0 {
		zap.S().Infof("PRUNE_SUCCESS: Removed %d stale telemetry vectors.", resMetrics.RowsAffected)
	}

	// Prune old audit logs (keep for 30 days instead of 7 for security compliance)
	auditCutoff := time.Now().Add(-30 * 24 * time.Hour)
	resAudit := m.DB.Unscoped().Where("created_at < ?", auditCutoff).Delete(&models.AuditLog{})
	if resAudit.RowsAffected > 0 {
		zap.S().Infof("PRUNE_SUCCESS: Purged %d deprecated audit logs.", resAudit.RowsAffected)
	}

	// Prune old notifications (keep for 7 days)
	resNotif := m.DB.Unscoped().Where("created_at < ?", cutoff).Delete(&models.Notification{})
	if resNotif.RowsAffected > 0 {
		zap.S().Infof("PRUNE_SUCCESS: Removed %d old notifications.", resNotif.RowsAffected)
	}
}

// CreateNotification creates a new notification for a user or all users (userID = 0)
func (m *DBManager) CreateNotification(userID uint, notifType, title, message string) error {
	notification := models.Notification{
		UserID:  userID,
		Type:    notifType,
		Title:   title,
		Message: message,
		IsRead:  false,
	}
	return m.DB.Create(&notification).Error
}
