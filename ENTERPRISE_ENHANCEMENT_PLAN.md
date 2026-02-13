# ARMOR-X1 Enterprise Enhancement Plan
## Pritunl-Style Organization & User Management

### 📋 **Overview**
This document outlines the comprehensive enhancement plan to transform ARMOR-X1 into an enterprise-grade VPN management platform similar to Pritunl, with full organization management, enhanced user management, and system settings.

---

## 🎯 **Phase 1: Backend Infrastructure** (Priority: HIGH)

### 1.1 Database Models ✅ COMPLETED
- [x] Add `Organization` model
- [x] Update `User` model with:
  - `organization_id` (foreign key)
  - `name` (full name)
  - `pin` (optional security PIN)
  - `email` (already exists)
- [x] Add to AutoMigrate

### 1.2 Organization API Endpoints (TO DO)
```
GET    /api/v1/organizations          - List all organizations
POST   /api/v1/organizations          - Create new organization
GET    /api/v1/organizations/:id      - Get organization details
PATCH  /api/v1/organizations/:id      - Update organization
DELETE /api/v1/organizations/:id      - Delete organization
GET    /api/v1/organizations/:id/users - List users in organization
```

### 1.3 Enhanced User API Endpoints (TO DO)
Update existing user endpoints to support:
- Organization filtering
- Email field (required)
- Name field
- PIN field (optional)

### 1.4 Settings API Endpoints (TO DO)
```
GET    /api/v1/settings               - Get system settings
PATCH  /api/v1/settings               - Update system settings
GET    /api/v1/settings/server        - Get server configuration
PATCH  /api/v1/settings/server        - Update server configuration
```

---

## 🎨 **Phase 2: Frontend Components** (Priority: HIGH)

### 2.1 Organization Management Page
**Location:** `/portal/src/components/organizations/OrganizationsPage.tsx`

**Features:**
- List all organizations with user count
- Create new organization modal
- Edit organization details
- Delete organization (with confirmation)
- View users in organization

**UI Elements:**
```
┌────────────────────────────────────────┐
│ Organizations                [+ Add]   │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ 🏢 Default Organization            │ │
│ │    15 users • Created 2 days ago   │ │
│ │    [Edit] [Delete] [View Users]    │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ 🏢 Engineering Team                │ │
│ │    8 users • Created 1 week ago    │ │
│ │    [Edit] [Delete] [View Users]    │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

### 2.2 Enhanced User Management
**Update:** `/portal/src/components/network/UserMatrix.tsx`

**Add Fields:**
- ✅ Email (required)
- ✅ Full Name
- ✅ Organization (dropdown)
- ✅ PIN (optional, 4-6 digits)
- ✅ Status (active/disabled)

**Form Layout:**
```
┌────────────────────────────────────────┐
│ Add New User                           │
├────────────────────────────────────────┤
│ Organization: [Dropdown ▼]             │
│ Username:     [____________]           │
│ Email:        [____________] *Required │
│ Full Name:    [____________]           │
│ Password:     [____________]           │
│ PIN:          [______] (Optional)      │
│ Role:         [Dropdown ▼]             │
│                                        │
│           [Cancel]  [Create User]      │
└────────────────────────────────────────┘
```

### 2.3 Settings Page
**Location:** `/portal/src/components/settings/SettingsPage.tsx`

**Tabs:**
1. **General Settings**
   - System name
   - Default organization
   - Session timeout
   - Enable/disable features

2. **Server Configuration**
   - WireGuard interface settings
   - DNS servers
   - Network ranges
   - Port configuration

3. **Security Settings**
   - Password policy
   - 2FA settings
   - PIN requirements
   - Session management

4. **Email Settings**
   - SMTP configuration
   - Email templates
   - Notification preferences

**UI Layout:**
```
┌────────────────────────────────────────┐
│ Settings                               │
├────────────────────────────────────────┤
│ [General] [Server] [Security] [Email] │
├────────────────────────────────────────┤
│                                        │
│ System Configuration                   │
│ ┌────────────────────────────────────┐ │
│ │ System Name:  [ARMOR-X1_______]   │ │
│ │ Timeout:      [30__] minutes      │ │
│ │ □ Enable 2FA                      │ │
│ │ □ Require Email Verification      │ │
│ └────────────────────────────────────┘ │
│                                        │
│              [Save Changes]            │
└────────────────────────────────────────┘
```

---

## 🔧 **Phase 3: Navigation & Integration** (Priority: MEDIUM)

### 3.1 Sidebar Updates
Add new menu items:
- **Organizations** (Admin only)
- **Settings** (Admin/Root only)

### 3.2 Dashboard Enhancements
- Organization selector (for multi-org users)
- Quick stats per organization
- Organization-filtered views

---

## 📊 **Phase 4: Data Migration & Seeding** (Priority: MEDIUM)

### 4.1 Default Organization
Create a default organization for existing users:
```go
func (m *DBManager) SeedDefaultOrganization() {
    var count int64
    m.DB.Model(&models.Organization{}).Count(&count)
    if count == 0 {
        org := models.Organization{Name: "Default Organization"}
        m.DB.Create(&org)
        
        // Assign all existing users to default org
        m.DB.Model(&models.User{}).Update("organization_id", org.ID)
    }
}
```

### 4.2 Update Seed Data
Update existing seed users with:
- Email addresses
- Full names
- Organization assignment

---

## 🚀 **Implementation Priority**

### **IMMEDIATE (Today)**
1. ✅ Organization model & migration
2. ⏳ Organization API endpoints
3. ⏳ Update User API to require email
4. ⏳ Organizations management page
5. ⏳ Enhanced user form with email

### **SHORT TERM (This Week)**
6. Settings page (basic)
7. Organization selector
8. Data migration script
9. Seed default organization

### **MEDIUM TERM (Next Week)**
10. Advanced settings (SMTP, 2FA)
11. Organization-based filtering
12. Bulk user import
13. Email notifications

---

## 📝 **API Specification**

### Organization Endpoints

#### Create Organization
```http
POST /api/v1/organizations
Content-Type: application/json

{
  "name": "Engineering Team"
}

Response: 201 Created
{
  "id": 1,
  "name": "Engineering Team",
  "created_at": "2026-02-11T15:30:00Z"
}
```

#### List Organizations
```http
GET /api/v1/organizations

Response: 200 OK
[
  {
    "id": 1,
    "name": "Default Organization",
    "user_count": 15,
    "created_at": "2026-02-10T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Engineering Team",
    "user_count": 8,
    "created_at": "2026-02-11T15:30:00Z"
  }
]
```

### Enhanced User Endpoints

#### Create User (Updated)
```http
POST /api/v1/users
Content-Type: application/json

{
  "organization_id": 1,
  "username": "john.doe",
  "email": "john.doe@company.com",     // REQUIRED
  "name": "John Doe",
  "password": "SecurePass123!",
  "pin": "1234",                        // OPTIONAL
  "role": "user"
}

Response: 201 Created
{
  "id": 5,
  "organization_id": 1,
  "username": "john.doe",
  "email": "john.doe@company.com",
  "name": "John Doe",
  "role": "user",
  "status": "active",
  "created_at": "2026-02-11T15:35:00Z"
}
```

---

## ✅ **Success Criteria**

### Must Have:
- [x] Organization model in database
- [ ] CRUD operations for organizations
- [ ] Email field required for new users
- [ ] Organization assignment for users
- [ ] Organizations management UI
- [ ] Enhanced user creation form

### Should Have:
- [ ] Settings page (basic)
- [ ] Default organization migration
- [ ] Organization filtering
- [ ] Bulk operations

### Nice to Have:
- [ ] Email notifications
- [ ] 2FA support
- [ ] LDAP/SSO integration
- [ ] Advanced RBAC per organization

---

## 🎯 **Next Steps**

1. **Create Organization API handlers** (`api/organizations.go`)
2. **Update User API** to support new fields
3. **Build OrganizationsPage component**
4. **Update UserMatrix form** with email & organization
5. **Add Settings page** (basic version)
6. **Test & Deploy**

---

**Last Updated:** 2026-02-11 15:30:00 +07:00
**Status:** In Progress - Phase 1 Complete
