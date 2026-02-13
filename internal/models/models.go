package models

import (
	"time"

	"gorm.io/gorm"
)

const (
	RoleUser  = "user"  // Self-service only
	RoleStaff = "staff" // Manage users (no delete)
	RoleAdmin = "admin" // Manage nodes + users (can delete users)
	RoleRoot  = "root"  // Full system control
)

type Organization struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"uniqueIndex;not null" json:"name"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type User struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	OrganizationID uint           `gorm:"index" json:"organization_id"` // Link to organization
	Username       string         `gorm:"uniqueIndex;not null" json:"username"`
	Email          string         `gorm:"uniqueIndex" json:"email"`
	Name           string         `json:"name"`          // Full name
	PIN            string         `json:"pin,omitempty"` // Optional PIN for additional security
	PasswordHash   string         `json:"-"`
	Role           string         `gorm:"default:user" json:"role"`
	Status         string         `gorm:"default:active" json:"status"` // active, revoked
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

type EdgeNode struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Name          string         `gorm:"uniqueIndex;not null" json:"name"`
	PublicIP      string         `gorm:"not null" json:"public_ip"`
	ListenPort    int            `gorm:"default:51820" json:"listen_port"`
	TunnelSubnet  string         `gorm:"uniqueIndex;not null" json:"tunnel_subnet"` // e.g. 10.8.1.0/24
	InterfaceName string         `gorm:"default:wg0" json:"interface_name"`
	Region        string         `gorm:"default:Global" json:"region"` // e.g. BKK-01, SG-EDGE
	Latitude      float64        `json:"lat"`
	Longitude     float64        `json:"lng"`
	Status        string         `gorm:"default:offline" json:"status"` // online, offline, syncing
	IsActive      bool           `gorm:"default:true" json:"is_active"`
	LastSeen      *time.Time     `json:"last_seen"`
	LastSyncHash  string         `gorm:"default:''" json:"last_sync_hash"` // Reported by Agent
	DesiredHash   string         `gorm:"default:''" json:"desired_hash"`   // Calculated by Manager
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type Peer struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	UserID        uint       `gorm:"not null" json:"user_id"`
	User          User       `json:"-"`
	NodeID        *uint      `gorm:"index" json:"node_id"` // Assigned Gateway
	Node          *EdgeNode  `json:"-"`
	PublicKey     string     `gorm:"uniqueIndex;not null" json:"public_key"`
	AssignedIP    string     `gorm:"uniqueIndex;not null" json:"assigned_ip"`
	AllowedIPs    string     `gorm:"default:0.0.0.0/0" json:"allowed_ips"`
	Status        string     `gorm:"default:active" json:"status"` // active, revoked
	DeviceName    string     `json:"device_name"`
	IsProvisioned bool       `gorm:"default:false" json:"is_provisioned"`
	CreatedAt     time.Time  `json:"created_at"`
	RotatedAt     *time.Time `json:"rotated_at"`

	// Transient stats (not in DB)
	ReceiveBytes  int64     `gorm:"-" json:"rx_bytes"`
	TransmitBytes int64     `gorm:"-" json:"tx_bytes"`
	LastHandshake time.Time `gorm:"-" json:"last_handshake"`
}

type AuditLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Timestamp  time.Time `gorm:"autoCreateTime" json:"timestamp"`
	ActorID    uint      `json:"actor_id"`
	Action     string    `json:"action"` // CREATE_PEER, REVOKE_PEER, etc.
	ResourceID string    `json:"resource_id"`
	Payload    string    `json:"payload"` // JSON details
	SourceIP   string    `json:"source_ip"`
}

type FirewallRule struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	Description string    `json:"description"`
	SourceIP    string    `json:"source_ip"`   // IP ของ Peer หรือ 'any'
	Destination string    `json:"destination"` // IP/Subnet ปลายทาง
	Port        string    `json:"port"`        // Port ปลายทาง หรือ 'any'
	Protocol    string    `json:"protocol"`    // tcp/udp/any
	Action      string    `json:"action"`      // ALLOW/DENY
}

type PeerMetric struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	PeerID    uint      `gorm:"index" json:"peer_id"`
	NodeID    uint      `gorm:"index" json:"node_id"`
	Timestamp time.Time `gorm:"index" json:"timestamp"`
	RxBytes   int64     `json:"rx_bytes"`
	TxBytes   int64     `json:"tx_bytes"`
}

type Notification struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"index" json:"user_id"`     // 0 = all users
	Type      string         `gorm:"default:info" json:"type"` // info, warning, error, success
	Title     string         `gorm:"not null" json:"title"`
	Message   string         `gorm:"not null" json:"message"`
	IsRead    bool           `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type SystemConfig struct {
	ID                    uint      `gorm:"primaryKey" json:"id"`
	MatrixName            string    `gorm:"default:'ARMOR-X1 COMMAND'" json:"matrix_name"`
	SupportEmail          string    `gorm:"default:'support@armor-x1.local'" json:"support_email"`
	PublicGatewayIP       string    `gorm:"default:'127.0.0.1'" json:"public_gateway_ip"`
	InternalSubnet        string    `gorm:"default:'10.9.0.0/22'" json:"internal_subnet"`
	DNSFilteringActive    bool      `gorm:"default:false" json:"dns_filtering_active"`
	PiHoleAddress         string    `gorm:"default:'127.0.0.1'" json:"pihole_address"`
	StealthAPNActive      bool      `gorm:"default:false" json:"stealth_apn_active"`
	StealthAPNHost        string    `json:"stealth_apn_host"`
	InternetAccessLimited bool      `gorm:"default:false" json:"internet_access_limited"`
	WANInterface          string    `gorm:"default:'eth0'" json:"wan_interface"`
	UpdatedAt             time.Time `json:"updated_at"`
}
