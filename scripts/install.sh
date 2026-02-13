#!/bin/bash

# ARMOR-X1 UNIFIED DEPLOYMENT SCRIPT
# Security Level: MIL-SPEC v1.2

set -e

# ANSI Colors for Terminal UI
BLUE='\033[1;34m'
GREEN='\033[1;32m'
CYAN='\033[1;36m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}    ARMOR-X1 SECURE MISSION DEPLOYMENT (v1.2)      ${NC}"
echo -e "${CYAN}----------------------------------------------------${NC}"
echo -e "${YELLOW}Phase 1: Environment Hardening & Pre-requisites${NC}"

# 1. Update & Dependencies
if [ -f /etc/debian_version ]; then
    sudo apt update && sudo apt install -y wireguard nftables curl git build-essential nginx nodejs npm
elif [ -f /etc/redhat-release ]; then
    sudo yum update -y && sudo yum install -y wireguard-tools nftables curl git nginx nodejs npm
fi

# 2. Network Intelligence
echo -e "${BLUE}[INFO] Enabling IP Forwarding (Strategic Vectoring)...${NC}"
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf > /dev/null
sudo sysctl -p > /dev/null

# 3. Web Infrastructure Layer (Nginx Reverse Proxy)
echo -e "${BLUE}[INFO] Configuring Strategic Web Gateway (Nginx Port 80)...${NC}"
NGINX_CONF="/etc/nginx/sites-available/armor-x1"
sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    server_name _;

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo systemctl enable nginx
sudo systemctl restart nginx

# 4. Environment Check
echo -e "${BLUE}[INFO] System Ready. Initializing Application Layer...${NC}"

# Check for Go (If not found, we build/download)
if ! command -v go &> /dev/null; then
    echo -e "${YELLOW}[WARN] Go runtime not found. Installing via Snap...${NC}"
    sudo snap install go --classic
fi

# 5. Build Strategic Assets...
echo -e "${BLUE}[INFO] Building Strategic Assets...${NC}"
# Build Backend
go build -o armor-server main.go

# Build Strategic CLI
echo -e "${BLUE}[INFO] Fabricating Strategic CLI Command Unit...${NC}"
go build -o armor cmd/armor/main.go
sudo ln -sf $(pwd)/armor /usr/local/bin/armor

# Build Frontend
cd portal && npm install && npm run build
cd ..

# 6. Process Management (Native Systemd - 100% Free)
echo -e "${BLUE}[INFO] Deploying Native Strategic Services (systemd)...${NC}"

# Backend Service
sudo bash -c "cat > /etc/systemd/system/armor-backend.service" <<EOF
[Unit]
Description=ARMOR-X1 Strategic Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/armor-server
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Frontend Service
sudo bash -c "cat > /etc/systemd/system/armor-frontend.service" <<EOF
[Unit]
Description=ARMOR-X1 Mission Control Portal
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/portal
ExecStart=/usr/bin/npm start -- --port 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Reload and Enable Services
sudo systemctl daemon-reload
sudo systemctl enable armor-backend armor-frontend
sudo systemctl restart armor-backend armor-frontend

echo -e "${GREEN}[SUCCESS] ARMOR-X1 NATIVE MISSION IS LIVE${NC}"
echo -e "${CYAN}Access Matrix at: http://$(curl -s ifconfig.me)${NC}"
echo -e "${CYAN}----------------------------------------------------${NC}"
