package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/max_kai/military-grade-wg/internal"
	"github.com/max_kai/military-grade-wg/internal/models"
)

func main() {
	godotenv.Load()
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "armor.db"
	}

	db, err := internal.NewDBManager(dsn)
	if err != nil {
		log.Fatalf("Critical: Could not connect to Strategic Data Matrix: %v", err)
	}

	if len(os.Args) < 2 {
		printUsage()
		return
	}

	command := os.Args[1]
	switch command {
	case "status":
		showStatus(db)
	case "user":
		handleUser(db, os.Args[2:])
	case "config":
		handleConfig(db, os.Args[2:])
	case "outreach":
		handleOutreach(db, os.Args[2:])
	default:
		fmt.Printf("Unknown command: %s\n", command)
		printUsage()
	}
}

func printUsage() {
	fmt.Println("\n\033[1;36m=== ARMOR-X1 STRATEGIC COMMAND LINE INTERFACE ===\033[0m")
	fmt.Println("Usage: armor <command> [subcommand] [args]")
	fmt.Println("\nCommands:")
	fmt.Println("  status             Show global system and node status")
	fmt.Println("  user list          List all enrolled identities")
	fmt.Println("  user add           Create a new commander/staff account")
	fmt.Println("  config show        Display current strategic parameters")
	fmt.Println("  outreach blackout  Toggle global internet blackout (on/off)")
	fmt.Println("  outreach dns       Set Pi-hole strategic DNS address")
	fmt.Println("\nExample: armor outreach blackout on")
}

func showStatus(db *internal.DBManager) {
	var userCount int64
	var peerCount int64
	var nodeCount int64
	db.DB.Model(&models.User{}).Count(&userCount)
	db.DB.Model(&models.Peer{}).Count(&peerCount)
	db.DB.Model(&models.EdgeNode{}).Count(&nodeCount)

	fmt.Println("\n\033[1;33m[STRATEGIC TELEMETRY]\033[0m")
	fmt.Printf("Identities: %d\n", userCount)
	fmt.Printf("Active Peers: %d\n", peerCount)
	fmt.Printf("Edge Nodes: %d\n", nodeCount)

	var config models.SystemConfig
	if err := db.DB.First(&config).Error; err == nil {
		fmt.Printf("Mission Name: %s\n", config.MatrixName)
		fmt.Printf("Blackout Mode: %v\n", config.InternetAccessLimited)
	}
}

func handleUser(db *internal.DBManager, args []string) {
	if len(args) < 1 {
		fmt.Println("Usage: armor user <list|add>")
		return
	}

	switch args[0] {
	case "list":
		var users []models.User
		db.DB.Find(&users)
		fmt.Println("\n\033[1;32m[ENROLLED IDENTITIES]\033[0m")
		fmt.Printf("%-5s | %-15s | %-10s | %-20s\n", "ID", "Username", "Role", "Email")
		fmt.Println(strings.Repeat("-", 60))
		for _, u := range users {
			fmt.Printf("%-5d | %-15s | %-10s | %-20s\n", u.ID, u.Username, u.Role, u.Email)
		}
	case "add":
		// Simplified add for CLI
		fmt.Println("Creation via web portal or setup wizard recommended for security.")
	}
}

func handleConfig(db *internal.DBManager, args []string) {
	var config models.SystemConfig
	db.DB.First(&config)

	if len(args) < 1 || args[0] == "show" {
		fmt.Println("\n\033[1;35m[GLOBAL PARAMETERS]\033[0m")
		fmt.Printf("Matrix Name:     %s\n", config.MatrixName)
		fmt.Printf("Support Email:   %s\n", config.SupportEmail)
		fmt.Printf("Gateway IP:      %s\n", config.PublicGatewayIP)
		fmt.Printf("Internal Subnet: %s\n", config.InternalSubnet)
		fmt.Printf("WAN Interface:   %s\n", config.WANInterface)
		return
	}
}

func handleOutreach(db *internal.DBManager, args []string) {
	if len(args) < 1 {
		fmt.Println("Usage: armor outreach <blackout|dns>")
		return
	}

	var config models.SystemConfig
	db.DB.First(&config)

	switch args[0] {
	case "blackout":
		if len(args) < 2 {
			fmt.Printf("Current Blackout Status: %v\n", config.InternetAccessLimited)
			return
		}
		status := strings.ToLower(args[1])
		if status == "on" || status == "true" {
			config.InternetAccessLimited = true
		} else {
			config.InternetAccessLimited = false
		}
		db.DB.Save(&config)
		fmt.Printf("Blackout Mode set to: %v\n", config.InternetAccessLimited)
	case "dns":
		if len(args) < 2 {
			fmt.Printf("Current DNS Proxy: %s\n", config.PiHoleAddress)
			return
		}
		config.PiHoleAddress = args[1]
		db.DB.Save(&config)
		fmt.Printf("Strategic DNS set to: %s\n", config.PiHoleAddress)
	}
}
