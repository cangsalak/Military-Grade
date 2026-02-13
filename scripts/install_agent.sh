#!/bin/bash

# ARMOR-X1: Mission-Critical Agent Installer
# Engineered for Rapid Deployment on Tactical Edge Nodes

set -e

echo "=== ARMOR-X1: Tactical Deployment Protocol ==="

if [[ $EUID -ne 0 ]]; then
   echo "🚨 ERROR: Deployment requires ROOT privileges (NET_ADMIN capability)."
   exit 1
fi

# 1. Dependency Verification
echo "[STAGING] Verifying WireGuard Kernel Module..."
if ! command -v wg &> /dev/null; then
    echo "⚠️  WireGuard tools not detected. Attempting transmission..."
    apt-get update && apt-get install -y wireguard-tools || {
        echo "🚨 CRITICAL: Failed to install WireGuard. Manual intervention required."
        exit 1
    }
fi

# 2. Workspace Setup
echo "[STAGING] Initializing tactical workspace..."
mkdir -p /etc/armor-x1
mkdir -p /opt/armor-x1

# 3. Environment Calibration
if [ ! -f /etc/armor-x1/agent.env ]; then
    echo "[CONFIG] Calibrating Security Token..."
    read -p "ENTER MISSION TOKEN: " AGENT_TOKEN
    cat <<EOF > /etc/armor-x1/agent.env
AGENT_TOKEN=$AGENT_TOKEN
AGENT_PORT=5000
GIN_MODE=release
EOF
    chmod 600 /etc/armor-x1/agent.env
fi

# 4. Systemd Synchronization
echo "[CORE] Synchronizing Systemd mission control..."
cat <<EOF > /etc/systemd/system/armor-agent.service
[Unit]
Description=ARMOR-X1 Tactical Edge Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/armor-x1
EnvironmentFile=/etc/armor-x1/agent.env
ExecStart=/opt/armor-x1/armor-agent
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 5. Final Deployment Status
echo ""
echo "=== DEPLOYMENT STAGE 1 COMPLETE ==="
echo "INSTRUCTIONS:"
echo "1. Place the 'armor-agent' binary in /opt/armor-x1/"
echo "2. Run: chmod +x /opt/armor-x1/armor-agent"
echo "3. Run: systemctl daemon-reload && systemctl enable --now armor-agent"
echo ""
echo "Mission Ready."
