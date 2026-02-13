export interface Peer {
    id: number;
    username: string;
    public_key: string;
    assigned_ip: string;
    status: 'active' | 'revoked';
    rx_bytes: number;
    tx_bytes: number;
    last_handshake: string;
}

export interface AuditLog {
    id: number;
    timestamp: string;
    action: string;
    resource_id: string;
    source_ip: string;
    payload: string;
}

export interface FirewallRule {
    id: number;
    created_at: string;
    description: string;
    source_ip: string;
    destination: string;
    port: string;
    protocol: string;
    action: 'ALLOW' | 'DENY';
}

export interface OnboardingData {
    config: string;
    private_key: string;
    public_key: string;
    assigned_ip: string;
}
