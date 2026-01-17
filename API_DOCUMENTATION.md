# TrustVault Backend - API Documentation

## Overview

Complete JWT-based authentication system with role-based access control (RBAC), activity logging, and blockchain anchoring.

**Features:**
- ✅ JWT Token-based Authentication (7-day expiration)
- ✅ Role-Based Access Control (RBAC) - USER & ADMIN
- ✅ Comprehensive Activity Logging to File
- ✅ Blockchain Anchoring of Critical Events
- ✅ In-Memory Database (Easy Migration to PostgreSQL)
- ✅ Error Handling & Validation

---

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create Activity Log File
```bash
touch activity.log
```

### 3. Start Server
```bash
npm start
# Or with watch mode:
npm run dev
```

Server runs on `http://localhost:5001` by default.

---

## Authentication Endpoints

### 1. Signup
```http
POST /signup
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_pass123",
  "role": "USER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "role": "USER"
  }
}
```

### 2. Login
```http
POST /login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_pass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "role": "USER"
  }
}
```

### 3. Get Current User
```http
GET /me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "role": "USER"
}
```

### 4. Logout
```http
POST /logout
Authorization: Bearer {token}
```

---

## Cases Management Endpoints

### 1. Create Case
```http
POST /cases
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Case #001",
  "description": "Description of the case"
}
```

**Allowed Roles:** USER, ADMIN

**Response:**
```json
{
  "success": true,
  "message": "Case created",
  "case": {
    "id": "uuid",
    "ownerUserId": "uuid",
    "ownerUsername": "john_doe",
    "name": "Case #001",
    "description": "...",
    "status": "OPEN",
    "createdAt": "2026-01-17T..."
  }
}
```

### 2. View Cases (Role-Filtered)
```http
GET /cases
Authorization: Bearer {token}
```

**Allowed Roles:** USER (sees own), ADMIN (sees all)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "cases": [...]
}
```

### 3. Get Case Details with Evidence
```http
GET /cases/:id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "case": {...},
  "evidence": [...]
}
```

### 4. Update Case Status
```http
PATCH /cases/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "RESOLVED"
}
```

**Valid Statuses:** OPEN, RESOLVED, CLOSED

**Allowed Roles:** USER (own cases only), ADMIN (any case)

---

## Evidence Management Endpoints

### 1. Add Evidence
```http
POST /evidence
Authorization: Bearer {token}
Content-Type: application/json

{
  "caseId": "uuid",
  "name": "video_evidence.mp4",
  "hash": "sha256_hash_here"
}
```

**Allowed Roles:** USER (own case), ADMIN (any case)

**Response:**
```json
{
  "success": true,
  "message": "Evidence added",
  "evidence": {
    "id": "uuid",
    "caseId": "uuid",
    "name": "video_evidence.mp4",
    "hash": "sha256...",
    "status": "UNVERIFIED",
    "addedBy": "john_doe",
    "createdAt": "2026-01-17T..."
  }
}
```

### 2. Verify Evidence
```http
POST /evidence/:id/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "isAuthentic": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Evidence verified as VERIFIED_AUTHENTIC",
  "evidence": {
    "id": "uuid",
    "status": "VERIFIED_AUTHENTIC",
    "verifiedAt": "2026-01-17T...",
    "verifiedBy": "john_doe"
  }
}
```

### 3. View Evidence for Case
```http
GET /evidence/:caseId
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "evidence": [...]
}
```

---

## Activity Logging Endpoints

### 1. Admin: View All Activity Logs
```http
GET /logs
Authorization: Bearer {token}

# Optional Query Parameters:
GET /logs?userId=uuid&action=LOGIN&limit=50&offset=0
```

**Allowed Roles:** ADMIN only

**Response:**
```json
{
  "success": true,
  "total": 156,
  "count": 50,
  "logs": [
    {
      "userId": "uuid",
      "username": "john_doe",
      "role": "USER",
      "action": "LOGIN",
      "endpoint": "POST /login",
      "status": 200,
      "durationMs": 45,
      "timestamp": "2026-01-17T14:30:22.123Z"
    },
    ...
  ]
}
```

### 2. User: View Own Activity Logs
```http
GET /logs/me
Authorization: Bearer {token}

# Optional Query Parameters:
GET /logs/me?limit=25&offset=0
```

**Response:**
```json
{
  "success": true,
  "total": 34,
  "count": 25,
  "logs": [...]
}
```

---

## Logged Activities

Every action is logged with:
- `userId` - User performing action
- `username` - Username
- `role` - User role
- `action` - Action type (see below)
- `endpoint` - HTTP method + URL
- `status` - HTTP status code
- `durationMs` - Request duration
- `timestamp` - ISO timestamp

### Action Types

| Action | Endpoint | Roles |
|--------|----------|-------|
| `SIGNUP` | POST /signup | - |
| `LOGIN` | POST /login | - |
| `LOGIN_FAILED` | POST /login | - |
| `LOGOUT` | POST /logout | USER, ADMIN |
| `CREATE_CASE` | POST /cases | USER, ADMIN |
| `VIEW_CASES` | GET /cases | USER, ADMIN |
| `VIEW_CASE_DETAILS` | GET /cases/:id | USER, ADMIN |
| `MARK_CASE_STATUS` | PATCH /cases/:id/status | USER, ADMIN |
| `ADD_EVIDENCE` | POST /evidence | USER, ADMIN |
| `VERIFY_EVIDENCE` | POST /evidence/:id/verify | USER, ADMIN |
| `VIEW_EVIDENCE` | GET /evidence/:caseId | USER, ADMIN |

---

## Role-Based Access Control

### USER Role
- ✅ Create own cases
- ✅ View own cases
- ✅ Mark own cases status
- ✅ Add evidence to own cases
- ✅ Verify evidence in own cases
- ✅ View own activity logs
- ❌ View other users' data
- ❌ View all activity logs

### ADMIN Role
- ✅ Create any case
- ✅ View all cases
- ✅ Mark any case status
- ✅ Add evidence to any case
- ✅ Verify evidence in any case
- ✅ View all activity logs
- ✅ Filter logs by user/action
- ✅ View all data

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden - insufficient permissions"
}
```

### 400 Bad Request
```json
{
  "error": "Username and password required"
}
```

### 404 Not Found
```json
{
  "error": "Case not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Activity Log File

Activity logs are stored in `activity.log` as JSON lines:

```json
{"userId":"uuid","username":"john_doe","role":"USER","action":"LOGIN","endpoint":"POST /login","status":200,"durationMs":45,"timestamp":"2026-01-17T14:30:22.123Z"}
{"userId":"uuid","username":"john_doe","role":"USER","action":"CREATE_CASE","endpoint":"POST /cases","status":201,"durationMs":12,"timestamp":"2026-01-17T14:30:35.456Z"}
```

View logs:
```bash
# Last 10 logs
tail -10 activity.log

# Format prettified
cat activity.log | jq '.'

# Filter by action
grep "LOGIN" activity.log | jq '.'
```

---

## Blockchain Anchoring

Critical events are anchored to blockchain:
- ✅ Successful login
- ✅ Case creation
- ✅ Evidence addition
- ✅ Evidence verification
- ✅ Case status changes

Each log is hashed and would be sent to smart contract in production:
```
⛓️  Anchored on-chain hash: a7f3c9d1e2b4f6a8c5d9e1b3f5a7c9d1e2b4f6a8c5d9e1b3f5a7c9d1e2b4f6
```

---

## Testing with cURL

### Signup
```bash
curl -X POST http://localhost:5001/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"secure123","role":"USER"}'
```

### Login
```bash
curl -X POST http://localhost:5001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"secure123"}'
```

### Create Case (Replace TOKEN)
```bash
curl -X POST http://localhost:5001/cases \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Case #001","description":"Test case"}'
```

### View Cases
```bash
curl -X GET http://localhost:5001/cases \
  -H "Authorization: Bearer TOKEN"
```

### View Activity Logs (Admin)
```bash
curl -X GET http://localhost:5001/logs \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Environment Variables

```bash
# .env or system environment
JWT_SECRET=your-secret-key-here
PORT=5001
```

---

## Migration to PostgreSQL

Currently uses in-memory database. To migrate to PostgreSQL:

1. Replace in-memory arrays with database queries
2. Update user table schema
3. Update cases table schema
4. Update evidence table schema
5. Keep activity logging to file or database

---

## Security Notes

⚠️ **Production Checklist:**
- [ ] Hash passwords with bcryptjs
- [ ] Use environment variables for JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Use CORS properly
- [ ] Add rate limiting
- [ ] Validate all inputs
- [ ] Add request size limits
- [ ] Set up monitoring/alerts
- [ ] Implement database backups
- [ ] Use secure cookie settings

---

## Support

Check `activity.log` for debugging purposes. All actions are logged with timestamps.

