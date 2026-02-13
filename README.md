# 🛡️ ARMOR-X1: Tactical WireGuard & Network Outreach Matrix

[![Security: MIL-SPEC](https://img.shields.io/badge/Security-MIL--SPEC-blue.svg)](https://github.com/max_kai/Military-Grade)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Uptime: 100%](https://img.shields.io/badge/Uptime-Resilient-emerald.svg)]()

**ARMOR-X1** is a high-performance, enterprise-grade WireGuard VPN management platform engineered for stealth deployments, hardened security, and strategic network outreach. Designed for Principal Network Architects and DevSecOps teams who require more than just a tunnel—they require a command center.

---

## 🕹️ Mission Overview

ARMOR-X1 transforms raw WireGuard capabilities into a unified tactical matrix. It provides a visual command interface to manage nodes globally, bypass network restrictions, and enforce strategic DNS policies.

### 🛰️ Key Tactical Features

*   **Strategic Outreach (APN Penetration):** Integrated SNI spoofing and stealth tunneling to bypass ISP isolation and restricted network layers.
*   **Mission Restriction (Internet Blackout):** A kernel-level "Kill Switch" to instantly air-gap your VPN matrix or allow selective internet outreach.
*   **Strategic DNS Filtering:** Built-in Pi-hole integration to enforce network-wide ad-blocking and malware protection.
*   **Geo-Spatial Oversight:** A real-time tactical map showing global node telemetry and connection vectors.
*   **Zero-Touch Deployment:** A unified MIL-SPEC installation script that automates Nginx, systemd, and WireGuard configuration.
*   **Process Persistence:** Native `systemd` integration ensuring 100% free, OS-level resilience across reboots.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Command Core (Backend)** | Go (Golang), Gin Gonic, GORM |
| **Mission Control (Frontend)** | Next.js 15+, Tailwind CSS, Framer Motion |
| **Data Matrix** | PostgreSQL / SQLite |
| **Signal Layer** | WireGuard Kernel Module |
| **Traffic Shaping** | nftables (Atomic Transactions) |
| **Web Gateway** | Nginx Reverse Proxy |

---

## 🚀 Deployment Instructions

### **1. Unified Initiation**
Run the core deployment script on a fresh Ubuntu/Debian instance:

```bash
git clone https://github.com/max_kai/Military-Grade.git armor-matrix
cd armor-matrix
bash scripts/install.sh
```

### **2. Strategic Initialization (Web Genesis)**
Once the services are live, access the Command Portal at `http://<your-server-ip>`. The system will automatically detect the uninitialized state and present the **ARMOR-X1 Web Genesis Wizard**.

Follow the UI to:
1.  Establish your **Organization Identity**.
2.  Deploy your **Root Commander Credentials**.
3.  Configure your **Strategic Infrastructure Parameters**.

### **4. Command Interface**
Access the web-based matrix at:
`http://<your-server-ip>`

*Note: Default administrative port is 80 (Redirected via Nginx Proxy).*

### **5. Strategic CLI (The Command Unit)**
Armor-X1 includes a powerful terminal-based controller. Once installed, use it from anywhere:

```bash
armor status             # View matrix telemetry
armor outreach blackout  # Toggle global blackout mode
armor config show        # View infrastructure parameters
```

---

## 📜 Strategic Configuration (`.env`)

Hardware-level parameters are managed via environment variables for maximum isolation:

*   `PORT`: API Gateway port (Default: 8080)
*   `DATABASE_URL`: Strategic data vector
*   `WG_INTERFACE_NAME`: Primary signal interceptor (Default: wg0)
*   `JWT_SECRET`: Mission-critical security secret

---

## 🛡️ Security Disclaimer

This platform is designed for legitimate network administration and strategic research. The developers are not responsible for any misuse. Ensure your deployment follows local laws and ISP terms of service.

---

**MISSION STATUS: READY FOR DEPLOYMENT**
*Engineered by Antigravity // Principal Network Architect*
