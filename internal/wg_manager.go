package internal

import (
	"fmt"
	"net"
	"os/exec"
	"strings"
	"sync"

	"github.com/max_kai/military-grade-wg/internal/models"
	"golang.zx2c4.com/wireguard/wgctrl"
	"golang.zx2c4.com/wireguard/wgctrl/wgtypes"
)

// WGManager handles raw WireGuard operations
type WGManager struct {
	mu     sync.Mutex
	client *wgctrl.Client
	HasWG  bool
	HasNFT bool
}

func (m *WGManager) CheckFunctional() {
	_, err1 := exec.LookPath("wg")
	m.HasWG = (err1 == nil)
	_, err2 := exec.LookPath("nft")
	m.HasNFT = (err2 == nil)
}

func NewWGManager() (*WGManager, error) {
	client, err := wgctrl.New()
	m := &WGManager{client: client}
	m.CheckFunctional()
	if err != nil {
		return m, fmt.Errorf("wireguard kernel access disabled: %w", err)
	}
	return m, nil
}

// GenerateKeypair creates a new WireGuard private and public key
func (m *WGManager) GenerateKeypair() (string, string, error) {
	key, err := wgtypes.GeneratePrivateKey()
	if err != nil {
		return "", "", err
	}
	return key.String(), key.PublicKey().String(), nil
}

// SyncPeer adds or updates a peer on a wireguard interface without restarting it
func (m *WGManager) SyncPeer(iface string, pubKeyStr string, allowedIPs []string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	pubKey, err := wgtypes.ParseKey(pubKeyStr)
	if err != nil {
		return fmt.Errorf("invalid public key: %w", err)
	}

	ips := make([]net.IPNet, 0, len(allowedIPs))
	for _, s := range allowedIPs {
		_, ipNet, err := net.ParseCIDR(s)
		if err != nil {
			return fmt.Errorf("invalid CIDR %s: %w", s, err)
		}
		ips = append(ips, *ipNet)
	}

	if m.client == nil || !m.HasWG {
		fmt.Printf("DevMode: Syncing peer %s with IPs %v\n", pubKeyStr, allowedIPs)
		return nil
	}

	peer := wgtypes.PeerConfig{
		PublicKey:         pubKey,
		ReplaceAllowedIPs: true,
		AllowedIPs:        ips,
	}

	cfg := wgtypes.Config{
		Peers: []wgtypes.PeerConfig{peer},
	}

	err = m.client.ConfigureDevice(iface, cfg)
	if err != nil {
		return fmt.Errorf("failed to configure device %s: %w", iface, err)
	}

	return nil
}

// RevokePeer removes a peer from the interface and drops traffic via nftables
func (m *WGManager) RevokePeer(iface string, pubKeyStr string, ipAddr string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	pubKey, err := wgtypes.ParseKey(pubKeyStr)
	if err != nil {
		return fmt.Errorf("invalid public key: %w", err)
	}

	if m.client != nil && m.HasWG {
		peer := wgtypes.PeerConfig{
			PublicKey: pubKey,
			Remove:    true,
		}

		err = m.client.ConfigureDevice(iface, wgtypes.Config{
			Peers: []wgtypes.PeerConfig{peer},
		})
		if err != nil {
			return fmt.Errorf("failed to remove peer from wireguard: %w", err)
		}
	}

	if m.HasNFT {
		cmd := exec.Command("nft", "add", "rule", "inet", "filter", "forward", "ip", "saddr", ipAddr, "drop")
		if output, err := cmd.CombinedOutput(); err != nil {
			fmt.Printf("Warning: nftables rule failed: %s\nOutput: %s\n", err, string(output))
		}
	} else {
		fmt.Printf("DevMode: Would drop traffic from %s via nftables\n", ipAddr)
	}

	return nil
}

func (m *WGManager) GetPublicKey(iface string) (string, error) {
	if m.client == nil || !m.HasWG {
		return "DEV_MODE_PUBKEY_" + iface + "_BASE64_KEY_HOLDER", nil
	}
	device, err := m.client.Device(iface)
	if err != nil {
		// Fallback for environments where wg exists but interface isn't up
		return "SERVER_MODE_PUBKEY_" + iface + "_VECTORS_INITIALIZED", nil
	}
	return device.PublicKey.String(), nil
}

func (m *WGManager) GetDevicePeers(iface string) ([]wgtypes.Peer, error) {
	if m.client == nil || !m.HasWG {
		return []wgtypes.Peer{}, nil
	}
	device, err := m.client.Device(iface)
	if err != nil {
		return nil, err
	}
	return device.Peers, nil
}

func (m *WGManager) GetInterfaceStatus(iface string) (bool, error) {
	if m.client == nil || !m.HasWG {
		return false, nil
	}
	_, err := m.client.Device(iface)
	if err != nil {
		return false, err
	}
	return true, nil
}

// SetFirewallRules applies security policies to the host using nftables atomically
func (m *WGManager) SetFirewallRules(rules []models.FirewallRule) error {
	if !m.HasNFT {
		fmt.Printf("DevMode: Skipping atomic firewall sync (nft missing)\n")
		return nil
	}
	m.mu.Lock()
	defer m.mu.Unlock()

	var nftCmd strings.Builder
	nftCmd.WriteString("add table inet wg_filter\n")
	nftCmd.WriteString("add chain inet wg_filter forward { type filter hook forward priority 0; policy accept; }\n")
	nftCmd.WriteString("flush chain inet wg_filter forward\n")

	for _, rule := range rules {
		nftCmd.WriteString("add rule inet wg_filter forward ")

		if rule.SourceIP != "any" && rule.SourceIP != "" {
			nftCmd.WriteString(fmt.Sprintf("ip saddr %s ", rule.SourceIP))
		}
		if rule.Destination != "any" && rule.Destination != "" {
			nftCmd.WriteString(fmt.Sprintf("ip daddr %s ", rule.Destination))
		}
		if rule.Protocol != "any" && rule.Protocol != "" {
			nftCmd.WriteString(fmt.Sprintf("%s ", rule.Protocol))
			if rule.Port != "any" && rule.Port != "" {
				nftCmd.WriteString(fmt.Sprintf("dport %s ", rule.Port))
			}
		}

		if rule.Action == "DENY" {
			nftCmd.WriteString("drop\n")
		} else {
			nftCmd.WriteString("accept\n")
		}
	}

	cmd := exec.Command("nft", "-f", "-")
	cmd.Stdin = strings.NewReader(nftCmd.String())
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Critical: Failed to apply NFT transaction: %v\nOutput: %s\n", err, string(output))
		return fmt.Errorf("firewall sync failed: %w", err)
	}

	return nil
}

// ApplySystemConfig applies global network strategies like NAT Masquerade and DNS Hijacking
func (m *WGManager) ApplySystemConfig(config models.SystemConfig) error {
	if !m.HasNFT {
		fmt.Printf("DevMode: Skipping system outreach application (nft missing)\n")
		return nil
	}
	m.mu.Lock()
	defer m.mu.Unlock()

	var nftCmd strings.Builder

	// 1. NAT Table & Masquerading (Internet Outreach)
	nftCmd.WriteString("add table ip armor_nat\n")
	nftCmd.WriteString("add chain ip armor_nat postrouting { type nat hook postrouting priority 100; policy accept; }\n")
	nftCmd.WriteString("flush chain ip armor_nat postrouting\n")

	// Apply Masquerade only if internet is NOT limited
	if config.WANInterface != "" && !config.InternetAccessLimited {
		nftCmd.WriteString(fmt.Sprintf("add rule ip armor_nat postrouting oifname \"%s\" masquerade\n", config.WANInterface))
	}

	// 2. DNS Hijacking (Strategic Filtering)
	nftCmd.WriteString("add chain ip armor_nat prerouting { type nat hook prerouting priority -100; policy accept; }\n")
	nftCmd.WriteString("flush chain ip armor_nat prerouting\n")
	if config.DNSFilteringActive && config.PiHoleAddress != "" {
		// Redirect DNS traffic from any interface to the strategic Pi-hole server
		nftCmd.WriteString(fmt.Sprintf("add rule ip armor_nat prerouting udp dport 53 dnat to %s\n", config.PiHoleAddress))
		nftCmd.WriteString(fmt.Sprintf("add rule ip armor_nat prerouting tcp dport 53 dnat to %s\n", config.PiHoleAddress))
	}

	// 3. Internet Limitation (Forwarding Drop)
	nftCmd.WriteString("add table inet armor_filter\n")
	nftCmd.WriteString("add chain inet armor_filter forward { type filter hook forward priority 0; policy accept; }\n")
	nftCmd.WriteString("flush chain inet armor_filter forward\n")

	if config.InternetAccessLimited && config.WANInterface != "" {
		// Strictly block outbound traffic to the WAN interface from the VPN network
		// We allow established traffic to return if necessary, but block new outbound initiations
		nftCmd.WriteString(fmt.Sprintf("add rule inet armor_filter forward oifname \"%s\" drop\n", config.WANInterface))
	}

	cmd := exec.Command("nft", "-f", "-")
	cmd.Stdin = strings.NewReader(nftCmd.String())
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Critical: Outreach application failed: %v\nOutput: %s\n", err, string(output))
		return fmt.Errorf("outreach sync failed: %w", err)
	}

	return nil
}
