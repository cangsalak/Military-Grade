package orchestrator

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/max_kai/military-grade-wg/internal/models"
)

type NodeOrchestrator struct {
	client *http.Client
	token  string
}

func NewNodeOrchestrator(token string) *NodeOrchestrator {
	return &NodeOrchestrator{
		token: token,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (o *NodeOrchestrator) SyncNodePeers(node models.EdgeNode, peers []models.Peer) error {
	url := fmt.Sprintf("http://%s:%d/agent/v1/sync", node.PublicIP, 5000) // Defaulting to Agent Port

	payload := struct {
		Interface string        `json:"interface"`
		Peers     []models.Peer `json:"peers"`
	}{
		Interface: node.InterfaceName,
		Peers:     peers,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-ARMOR-TOKEN", o.token)

	resp, err := o.client.Do(req)
	if err != nil {
		return fmt.Errorf("agent connection failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("agent returned error status: %d", resp.StatusCode)
	}

	return nil
}

func (o *NodeOrchestrator) SyncNodeFirewall(node models.EdgeNode, rules []models.FirewallRule) error {
	url := fmt.Sprintf("http://%s:%d/agent/v1/firewall", node.PublicIP, 5000)

	jsonData, err := json.Marshal(rules)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-ARMOR-TOKEN", o.token)

	resp, err := o.client.Do(req)
	if err != nil {
		return fmt.Errorf("agent firewall connection failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("agent firewall error: %d", resp.StatusCode)
	}

	return nil
}

func (o *NodeOrchestrator) PingNode(node models.EdgeNode) (bool, error) {
	status, err := o.GetNodeStatus(node)
	if err != nil {
		return false, err
	}
	return status.Online, nil
}

type NodeStatus struct {
	Online       bool
	LastSyncHash string
}

func (o *NodeOrchestrator) GetNodeStatus(node models.EdgeNode) (NodeStatus, error) {
	url := fmt.Sprintf("http://%s:%d/agent/v1/status", node.PublicIP, 5000)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return NodeStatus{}, err
	}

	req.Header.Set("X-ARMOR-TOKEN", o.token)

	resp, err := o.client.Do(req)
	if err != nil {
		return NodeStatus{}, fmt.Errorf("node unreachable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return NodeStatus{}, fmt.Errorf("agent unauthorized or error: %d", resp.StatusCode)
	}

	var data struct {
		Online       bool   `json:"online"`
		LastSyncHash string `json:"last_sync_hash"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return NodeStatus{}, fmt.Errorf("failed to decode status: %w", err)
	}

	return NodeStatus{
		Online:       data.Online,
		LastSyncHash: data.LastSyncHash,
	}, nil
}

func (o *NodeOrchestrator) GetNodePeers(node models.EdgeNode) ([]models.Peer, error) {
	url := fmt.Sprintf("http://%s:%d/agent/v1/status?interface=%s", node.PublicIP, 5000, node.InterfaceName)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-ARMOR-TOKEN", o.token)

	resp, err := o.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("node unreachable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("agent error: %d", resp.StatusCode)
	}

	var data struct {
		Peers []models.Peer `json:"peers"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed to decode metrics: %w", err)
	}
	return data.Peers, nil
}

func (o *NodeOrchestrator) StreamNodeLogs(node models.EdgeNode) (*http.Response, error) {
	url := fmt.Sprintf("http://%s:%d/agent/v1/logs", node.PublicIP, 5000)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-ARMOR-TOKEN", o.token)
	req.Header.Set("Accept", "text/event-stream")

	return o.client.Do(req)
}
