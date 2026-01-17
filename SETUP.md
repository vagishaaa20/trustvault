# Quick Setup Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create Activity Log
```bash
touch activity.log
```

### 3. Start Server
```bash
npm start
```

Server runs on: **http://localhost:5001**

---

## 📝 Testing

### Create Test Users

**User Account:**
```bash
curl -X POST http://localhost:5001/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "pass123",
    "role": "USER"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {"id": "...", "username": "john_doe", "role": "USER"}
}
```

Save the token as: `USER_TOKEN=eyJhbGc...`

**Admin Account:**
```bash
curl -X POST http://localhost:5001/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_user",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

Save the token as: `ADMIN_TOKEN=eyJhbGc...`

---

### 2. Create a Case

```bash
curl -X POST http://localhost:5001/cases \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Case #001",
    "description": "Test evidence case"
  }'
```

Save case ID: `CASE_ID=...`

---

### 3. Add Evidence

```bash
curl -X POST http://localhost:5001/evidence \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caseId": "'$CASE_ID'",
    "name": "video_evidence.mp4",
    "hash": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6"
  }'
```

Save evidence ID: `EVIDENCE_ID=...`

---

### 4. Verify Evidence

```bash
curl -X POST http://localhost:5001/evidence/$EVIDENCE_ID/verify \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isAuthentic": true}'
```

---

### 5. View Cases

```bash
curl -X GET http://localhost:5001/cases \
  -H "Authorization: Bearer $USER_TOKEN"
```

---

### 6. Mark Case as Resolved

```bash
curl -X PATCH http://localhost:5001/cases/$CASE_ID/status \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "RESOLVED"}'
```

---

### 7. View Your Activity Logs

```bash
curl -X GET http://localhost:5001/logs/me \
  -H "Authorization: Bearer $USER_TOKEN"
```

---

### 8. Admin: View All Activity Logs

```bash
curl -X GET http://localhost:5001/logs \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 📊 Activity Log File

View logs:
```bash
cat activity.log | jq '.'
```

See last 5 activities:
```bash
tail -5 activity.log | jq '.'
```

Filter by action:
```bash
grep "LOGIN\|CREATE_CASE" activity.log | jq '.'
```

---

## 🔑 Key Features

✅ **JWT Authentication** - 7-day token expiration
✅ **RBAC** - USER & ADMIN roles with permission checks
✅ **Activity Logging** - All actions logged to file
✅ **Blockchain Anchoring** - Critical events hashed
✅ **Error Handling** - Comprehensive validation
✅ **In-Memory DB** - Easy to extend with PostgreSQL

---

## 🛑 Troubleshooting

**Port 5001 already in use?**
```bash
# Find process
lsof -i :5001

# Kill it
kill -9 <PID>
```

**Token expired?**
- Login again to get a new token

**Permission denied?**
- Check your role (USER vs ADMIN)
- Check you own the resource

---

## 📚 Full Documentation

See `API_DOCUMENTATION.md` for complete endpoint reference.

