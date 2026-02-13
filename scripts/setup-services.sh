#!/bin/bash
set -e
# Deployment Path Intelligence
CWD=$(pwd)
USER_ID=$(whoami)

echo "Deploying Strategic Service Units..."

# 1. Backend Tactical Unit
sudo bash -c "cat > /etc/systemd/system/armor-backend.service" <<EOF
[Unit]
Description=ARMOR-X1 Strategic Backend
After=network.target

[Service]
Type=simple
User=$USER_ID
WorkingDirectory=$CWD
ExecStart=$CWD/armor-server
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 2. mission Control Portal Unit
sudo bash -c "cat > /etc/systemd/system/armor-frontend.service" <<EOF
[Unit]
Description=ARMOR-X1 Mission Control Portal
After=network.target

[Service]
Type=simple
User=$USER_ID
WorkingDirectory=$CWD/portal
ExecStart=/usr/bin/npm start -- --port 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 3. Activation
sudo systemctl daemon-reload
sudo systemctl enable armor-backend armor-frontend
sudo systemctl restart armor-backend armor-frontend

echo "[SUCCESS] Strategic services are now active and managed by the matrix."
