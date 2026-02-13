# ARMOR-X1 Testing Credentials

## ✅ System Status: FULLY OPERATIONAL

**Backend:** Running on http://localhost:8080  
**Frontend:** Running on http://localhost:3000  
**Database:** PostgreSQL (Docker container)  
**All Users:** ✅ Verified and Ready

---

## 🔐 Test User Accounts

The system automatically seeds the following test accounts on first startup:

### 1. ROOT User (Full System Access) ✅
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@armor-x1.local`
- **Role:** Root
- **Permissions:** Complete system control, all features unlocked
- **Status:** ✅ Login Verified

### 2. ADMIN User (Gateway & Policy Management) ✅
- **Username:** `commander`
- **Password:** `admin123`
- **Email:** `commander@armor-x1.local`
- **Role:** Admin
- **Permissions:** Gateway management, firewall policies, analytics, audit logs
- **Status:** ✅ Login Verified

### 3. STAFF User (Peer Management) ✅
- **Username:** `operator`
- **Password:** `staff123`
- **Email:** `operator@armor-x1.local`
- **Role:** Staff
- **Permissions:** Peer provisioning, user management, network topology
- **Status:** ✅ Login Verified

### 4. REGULAR User (View Only) ✅
- **Username:** `viewer`
- **Password:** `user123`
- **Email:** `viewer@armor-x1.local`
- **Role:** User
- **Permissions:** Personal access panel only
- **Status:** ✅ Login Verified

---

## 🚀 Quick Start Guide

### Backend (Docker) - Already Running ✅
```bash
# Start PostgreSQL + Backend
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose down && docker-compose up -d --build
```

### Frontend (Local Dev Server) - Already Running ✅
```bash
# Already running on http://localhost:3000
# If not started:
cd portal
npm run dev
```

### Access Points
- **Frontend:** http://localhost:3000 ✅
- **Backend API:** http://localhost:8080 ✅
- **Health Check:** http://localhost:8080/health ✅

---

## 🧪 Testing Workflow

### Automated Login Test
```bash
# Run automated login test for all users
./scripts/test-login.sh
```

### Manual Web Testing

1. **Login as ROOT** (`admin` / `admin123`)
   - Open http://localhost:3000
   - Login with credentials
   - Test all features:
     - ✓ Gateway Matrix (create/edit/delete nodes)
     - ✓ Node Matrix (peer management)
     - ✓ User Matrix (user management)
     - ✓ Firewall Panel (policy management)
     - ✓ Analytics Dashboard
     - ✓ Audit Logs
     - ✓ Tactical Map (geo-location)
     - ✓ Batch Migration

2. **Login as ADMIN** (`commander` / `admin123`)
   - Verify gateway management access
   - Test policy enforcement
   - Check analytics dashboard
   - Verify audit log access

3. **Login as STAFF** (`operator` / `staff123`)
   - Provision new peers
   - Manage users
   - View network topology
   - Test batch migration

4. **Login as USER** (`viewer` / `user123`)
   - Verify limited access
   - Check personal access panel only
   - Confirm no admin features visible

---

## 📊 System Validation Results

✅ **Backend Build:** Success  
✅ **Frontend Build:** Success  
✅ **Database Connection:** Success  
✅ **User Seeding:** 4/4 Users Created  
✅ **Authentication:** All Roles Verified  
✅ **API Health:** Operational  

---

## 📝 Important Notes

- All passwords are for **TESTING ONLY**
- Change passwords in production
- Database persists in Docker volume `pgdata`
- Frontend connects to backend via Next.js proxy
- WireGuard kernel access may show warnings (expected in Docker)
- System is fully functional for testing all features

---

## 🔧 Troubleshooting

### Backend not responding?
```bash
docker-compose logs app
docker-compose restart app
```

### Database connection issues?
```bash
docker exec wg-armor-db psql -U postgres -d wg_db -c "SELECT version();"
```

### Frontend not loading?
```bash
cd portal
npm run dev
```

### Reset everything?
```bash
docker-compose down -v  # WARNING: Deletes all data
docker-compose up -d --build
```
