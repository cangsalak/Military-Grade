#!/bin/bash

# ARMOR-X1 Tactical Edge Agent Build Script
# Engineered for Multi-Platform Deployment (x86_64, ARM64)

set -e

APP_NAME="armor-agent"
BUILD_DIR="build/agent"
CMD_PATH="cmd/agent/main.go"

echo "=== ARMOR-X1: Agent Fabrication Matrix ==="
echo "Targeting mission-critical platforms..."

# Prepare build directory
mkdir -p $BUILD_DIR

# 1. Build for Linux AMD64 (Standard Servers)
echo "[DEPLOY] Fabricating Linux AMD64 binary..."
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o $BUILD_DIR/${APP_NAME}-linux-amd64 $CMD_PATH

# 2. Build for Linux ARM64 (Edge/Raspberry Pi)
echo "[DEPLOY] Fabricating Linux ARM64 binary..."
GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o $BUILD_DIR/${APP_NAME}-linux-arm64 $CMD_PATH

# 3. Build for Linux ARM v7 (Older Edge Hardware)
echo "[DEPLOY] Fabricating Linux ARMv7 binary..."
GOOS=linux GOARCH=arm GOARM=7 go build -ldflags="-s -w" -o $BUILD_DIR/${APP_NAME}-linux-armv7 $CMD_PATH

echo ""
echo "=== FABRICATION COMPLETE ==="
ls -lh $BUILD_DIR
echo ""
echo "Binaries ready for tactical deployment in $BUILD_DIR"
