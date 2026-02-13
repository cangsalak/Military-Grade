package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/max_kai/military-grade-wg/api"
	"github.com/max_kai/military-grade-wg/internal"
	"github.com/max_kai/military-grade-wg/internal/models"
	"go.uber.org/zap"
)

func main() {
	internal.InitLogger()
	logger := internal.GetLogger()
	defer logger.Sync()

	fmt.Println("=== Enterprise WireGuard Automation Platform ===")
	logger.Info("Starting Enterprise WireGuard Platform", zap.String("version", "v1.2"))

	godotenv.Load()

	// 1. Init Database
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "armor.db" // Fallback to sqlite if postgres not defined (optional refactor)
	}
	// For simplicity in this demo, let's keep the postgres logic but add a check
	db, err := internal.NewDBManager(dsn)
	if err != nil {
		log.Fatalf("Failed to init DB: %v", err)
	}

	// CHECK FOR SYSTEM INITIALIZATION
	var userCount int64
	db.DB.Model(&models.User{}).Count(&userCount)
	if userCount == 0 {
		logger.Warn("SYSTEM_UNINITIALIZED: Strategic Matrix is awaiting Web Genesis. Access Command Portal to begin setup.")
	}

	// 2. Init IPAM
	ipam, err := internal.NewIPAM("10.8.0.0/22")
	if err != nil {
		log.Fatalf("Failed to init IPAM: %v", err)
	}

	// 3. Init WG Manager
	wg, err := internal.NewWGManager()
	if err != nil {
		fmt.Printf("Warning: WireGuard Kernel access denied (%v)\n", err)
		// เราอนุญาตให้รันต่อเพื่อทำ Logic test/API test ได้
	}

	// 4. Start Analytics Engine
	analytics := internal.NewAnalyticsEngine(wg, db)
	analytics.StartCollector(1 * time.Minute)

	// 5. Start API Server
	server := api.NewServer(wg, ipam, db)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 6. Strategic Persistence: Re-apply global network parameters on boot
	var sysConfig models.SystemConfig
	if err := db.DB.First(&sysConfig).Error; err == nil {
		logger.Info("BOOT_SYNC: Re-applying strategic outreach parameters to kernel")
		if err := wg.ApplySystemConfig(sysConfig); err != nil {
			logger.Error("BOOT_SYNC_FAILED: Could not re-apply network strategy", zap.Error(err))
		}
	}

	fmt.Printf("\nServer starting on :%s\n", port)
	if err := server.Run(":" + port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
