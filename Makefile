# 🎖️ ARMOR-X1 OPERATIONAL COMMAND MANIFEST
# VERSION: 1.0.1
# CLASSIFICATION: CONFIDENTIAL

.PHONY: setup init up down logs shell certs

# --- MISSION PARAMETERS ---
DC = docker-compose
INIT_SCRIPT = ./scripts/init-host.sh

# --- COMMANDS ---

all: setup init up

setup:
	@echo "[CMD] Preparing operational environment..."
	@mkdir -p logs
	@chmod +x scripts/*.sh

init:
	@echo "[CMD] Initializing tactical host matrix..."
	@sudo $(INIT_SCRIPT)

up:
	@echo "[CMD] Deploying ARMOR-X1 Controller..."
	$(DC) up -d --build

down:
	@echo "[CMD] Terminating operational platform..."
	$(DC) down

logs:
	@echo "[CMD] Streaming telemetry logs..."
	$(DC) logs -f app

shell:
	@echo "[CMD] Entering controller shell..."
	docker exec -it wg-armor-controller sh

status:
	@echo "[CMD] Checking kernel interface status..."
	@sudo wg show
	@echo "\n[CMD] Checking firewall matrix..."
	@sudo nft list ruleset

clean:
	@echo "[CMD] Full biological purge of local containers..."
	$(DC) down -v --rmi all
