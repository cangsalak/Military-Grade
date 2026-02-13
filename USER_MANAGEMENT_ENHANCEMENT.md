# User Management Enhancement Plan
**Date:** 2026-02-11 15:42:00  
**Priority:** CRITICAL - Core VPN Features Missing

---

## 🚨 **Missing Critical Features**

### **Current State:**
- ❌ No Edit User functionality
- ❌ No Download WireGuard Config
- ❌ No QR Code display
- ❌ No Usage Statistics (bandwidth, last seen)
- ✅ Only Delete button exists

### **Required Features (Pritunl Standard):**

#### **1. Edit User** 🔴 CRITICAL
- Edit user profile (email, name, role, organization)
- Change password
- Update PIN
- Enable/Disable user

#### **2. Download Config** 🔴 CRITICAL
- Generate WireGuard config file
- Download as `.conf` file
- Include all necessary keys and settings

#### **3. QR Code** 🔴 CRITICAL
- Generate QR code from config
- Display in modal
- Allow mobile scanning
- Print-friendly view

#### **4. Usage Statistics** 🟡 HIGH PRIORITY
- Total bandwidth (upload/download)
- Last seen timestamp
- Connection status
- Data transfer rate

---

## 📋 **Implementation Steps**

### **Phase 1: User Table Enhancement**

#### **Add Columns to Table:**
```tsx
<th>User Info</th>
<th>Organization</th>
<th>Role</th>
<th>Status</th>
<th>Usage</th>        ← NEW
<th>Last Seen</th>    ← NEW
<th>Actions</th>
```

#### **Add Action Buttons:**
```tsx
[Edit] [Config ↓] [QR] [Delete]
```

---

### **Phase 2: Edit User Modal**

**Fields:**
- Organization (dropdown)
- Username (readonly)
- Email (editable)
- Full Name (editable)
- PIN (editable)
- Role (dropdown)
- Status (active/disabled toggle)
- Password (optional change)

---

### **Phase 3: Config Download**

**Backend API:**
```
GET /api/v1/users/:id/config
```

**Response:**
```ini
[Interface]
PrivateKey = <user_private_key>
Address = <assigned_ip>
DNS = 1.1.1.1

[Peer]
PublicKey = <server_public_key>
Endpoint = <server_ip>:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

---

### **Phase 4: QR Code Generation**

**Library:** `qrcode.react`

**Modal Display:**
- Large QR code (300x300px)
- Config text below
- Print button
- Download QR as PNG

---

### **Phase 5: Usage Statistics**

**Backend API:**
```
GET /api/v1/users/:id/stats
```

**Response:**
```json
{
  "total_rx": 1024000000,
  "total_tx": 512000000,
  "last_seen": "2026-02-11T15:30:00Z",
  "status": "online"
}
```

**Display:**
- 📊 Total: 1.5 GB (↓1.0 GB ↑512 MB)
- 🕐 Last seen: 10 minutes ago
- 🟢 Status: Online

---

## 🔧 **Technical Implementation**

### **Files to Modify:**

#### **Backend:**
```
✅ api/server.go           - Add edit user endpoint
✅ api/server.go           - Add config download endpoint
✅ api/server.go           - Add QR code endpoint
✅ api/server.go           - Add user stats endpoint
```

#### **Frontend:**
```
✅ UserMatrix.tsx          - Add edit modal
✅ UserMatrix.tsx          - Add config download
✅ UserMatrix.tsx          - Add QR modal
✅ UserMatrix.tsx          - Add usage display
```

### **New Dependencies:**
```bash
npm install qrcode.react
npm install file-saver
```

---

## 📊 **UI Mockup**

### **Enhanced User Table:**
```
┌────────────────────────────────────────────────────────────────────────────┐
│ User Info          │ Org     │ Role  │ Status │ Usage      │ Last Seen    │ Actions │
├────────────────────────────────────────────────────────────────────────────┤
│ 👤 john.doe        │ Default │ USER  │ 🟢     │ ↓1.2GB     │ 5 min ago    │ [Edit]  │
│    john@company    │         │       │ Active │ ↑500MB     │              │ [⬇Conf] │
│                    │         │       │        │            │              │ [QR]    │
│                    │         │       │        │            │              │ [Del]   │
└────────────────────────────────────────────────────────────────────────────┘
```

### **Edit User Modal:**
```
┌──────────────────────────────────────┐
│ Edit User: john.doe                  │
├──────────────────────────────────────┤
│ Organization: [Default Org ▼]        │
│ Username:     john.doe (readonly)    │
│ Email:        [john@company.com]     │
│ Full Name:    [John Doe_______]      │
│ PIN:          [1234__]               │
│ Role:         [USER ▼]               │
│ Status:       [●Active ○Disabled]    │
│                                      │
│ Change Password (optional):          │
│ New Password: [••••••••]             │
│                                      │
│        [Cancel]  [Save Changes]      │
└──────────────────────────────────────┘
```

### **QR Code Modal:**
```
┌──────────────────────────────────────┐
│ WireGuard Configuration              │
├──────────────────────────────────────┤
│                                      │
│        ┌─────────────────┐           │
│        │                 │           │
│        │   QR  CODE      │           │
│        │   [300x300]     │           │
│        │                 │           │
│        └─────────────────┘           │
│                                      │
│ Scan with WireGuard mobile app       │
│                                      │
│ [Download Config] [Download QR PNG]  │
│                                      │
│ Config Preview:                      │
│ ┌──────────────────────────────────┐ │
│ │ [Interface]                      │ │
│ │ PrivateKey = xxx...              │ │
│ │ Address = 10.0.0.5/24            │ │
│ └──────────────────────────────────┘ │
│                                      │
│              [Close]                 │
└──────────────────────────────────────┘
```

---

## ⏱️ **Implementation Timeline**

### **Immediate (Next 30 minutes):**
1. ✅ Add Edit User modal
2. ✅ Add Update User API endpoint
3. ✅ Add Config Download button
4. ✅ Add QR Code modal

### **Short Term (Next hour):**
5. ✅ Add Usage Statistics display
6. ✅ Add Last Seen column
7. ✅ Test all features end-to-end

---

## 🎯 **Success Criteria**

- [ ] Can edit user profile
- [ ] Can download WireGuard config
- [ ] Can view QR code
- [ ] Can see usage statistics
- [ ] Can see last seen time
- [ ] All features work in UI
- [ ] All API endpoints tested

---

**Status:** 🔴 IN PROGRESS  
**Priority:** CRITICAL - Core VPN functionality
