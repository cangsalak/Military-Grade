package internal

import (
	"errors"
	"net"
	"sync"
)

type IPAM struct {
	mu     sync.Mutex
	subnet *net.IPNet
	used   map[string]bool
}

func NewIPAM(cidr string) (*IPAM, error) {
	_, ipNet, err := net.ParseCIDR(cidr)
	if err != nil {
		return nil, err
	}
	return &IPAM{
		subnet: ipNet,
		used:   make(map[string]bool),
	}, nil
}

// Allocate finds the next available IP in the subnet
func (i *IPAM) Allocate() (string, error) {
	i.mu.Lock()
	defer i.mu.Unlock()

	ip := make(net.IP, len(i.subnet.IP))
	copy(ip, i.subnet.IP)

	// Increment IP starting from .2 (assuming .1 is gateway)
	for {
		incIP(ip)
		if !i.subnet.Contains(ip) {
			break
		}

		// Skip network and broadcast
		if ip[len(ip)-1] == 0 || ip[len(ip)-1] == 255 {
			continue
		}

		ipStr := ip.String()
		if !i.used[ipStr] {
			i.used[ipStr] = true
			return ipStr, nil
		}
	}

	return "", errors.New("no available IPs in subnet")
}

func (i *IPAM) Release(ip string) {
	i.mu.Lock()
	defer i.mu.Unlock()
	delete(i.used, ip)
}

func incIP(ip net.IP) {
	for j := len(ip) - 1; j >= 0; j-- {
		ip[j]++
		if ip[j] > 0 {
			break
		}
	}
}

func (i *IPAM) RegisterUsed(ip string) {
	i.mu.Lock()
	defer i.mu.Unlock()
	i.used[ip] = true
}
