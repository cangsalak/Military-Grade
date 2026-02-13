package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/max_kai/military-grade-wg/internal"
	"github.com/max_kai/military-grade-wg/internal/agent"
)

func main() {
	fmt.Println("=== ARMOR-X1: Tactical Edge Agent ===")
	godotenv.Load()

	// 1. Initialize Logger
	internal.InitLogger()
	logger := internal.GetLogger()
	defer logger.Sync()

	// 2. Initialize WG Manager (Kernel talker)
	wg, err := internal.NewWGManager()
	if err != nil {
		log.Fatalf("Critical: Kernel access denied. Agent requires root/NET_ADMIN. Error: %v", err)
	}

	// 3. Get Security Token from Env
	token := os.Getenv("AGENT_TOKEN")
	if token == "" {
		token = "DEFAULT_INSECURE_AGENT_TOKEN_CHANGE_ME"
	}

	// 4. Start Agent API
	port := os.Getenv("AGENT_PORT")
	if port == "" {
		port = "5000"
	}

	server := agent.NewArmorAgent(wg, token)
	fmt.Printf("[SYNC] Agent listening for Manager on :%s\n", port)

	if err := server.Run(":" + port); err != nil {
		log.Fatalf("Agent startup failed: %v", err)
	}
}
