#!/bin/bash

# ARMOR-X1 STRATEGIC DECOMMISSIONING SCRIPT
# Security Level: ROOT CLEARANCE REQUIRED
# This script will terminate all mission assets and scrub the local matrix.

set -e

# ANSI Colors for Terminal UI
RED='\033[1;31m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
NC='\033[0m' # No Color

echo -e "${RED}====================================================${NC}"
echo -e "${RED}    ARMOR-X1 SYSTEM PURGE & DECOMMISSIONING         ${NC}"
echo -e "${RED}====================================================${NC}"
echo -e "${YELLOW}[WARNING] This operation will terminate all services and delete mission data.${NC}"
read -p "Are you sure you want to proceed with the total scrub? (y/N): " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo -e "${CYAN}[ABORTED] Decommissioning sequence terminated.${NC}"
    exit 0
fi

# 1. Terminate Active Services
echo -e "${CYAN}[1/5] Terminating Strategic Services...${NC}"
sudo systemctl stop armor-backend armor-frontend 2>/dev/null || true
sudo systemctl disable armor-backend armor-frontend 2>/dev/null || true

# 2. Scrub Systemd Configurations
echo -e "${CYAN}[2/5] Scrubbing Service Unit Files...${NC}"
sudo rm -f /etc/systemd/system/armor-backend.service
sudo rm -f /etc/systemd/system/armor-frontend.service
sudo systemctl daemon-reload

# 3. Dismantle Web Gateway
echo -e "${CYAN}[3/5] Dismantling Nginx Proxy Configurations...${NC}"
sudo rm -f /etc/nginx/sites-enabled/armor-x1
sudo rm -f /etc/nginx/sites-available/armor-x1
sudo systemctl restart nginx

# 4. Remove Global Binaries (CLI)
echo -e "${CYAN}[4/5] Decommissioning Strategic CLI Command Unit...${NC}"
sudo rm -f /usr/local/bin/armor

# 5. Scrub Mission Directory
echo -e "${CYAN}[5/5] Purging Local Workspace Assets...${NC}"
# Delete the repository files but keep the script running till the end
TARGET_DIR=$(pwd)
if [[ $TARGET_DIR == *"Military-Grade-main"* ]]; then
    cd ..
    sudo rm -rf "$TARGET_DIR"
    echo -e "${RED}[SCRUBBED] Final asset remnants destroyed.${NC}"
else
    echo -e "${YELLOW}[NOTICE] Workspace directory not targeting current path. Manual deletion of 'Military-Grade-main' may be required.${NC}"
fi

echo -e "${RED}====================================================${NC}"
echo -e "${RED}    MISSION TERMINATED: SYSTEM IS CLEAN             ${NC}"
echo -e "${RED}====================================================${NC}"
