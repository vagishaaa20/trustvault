# User Activity Logging System - Implementation Guide

## 📋 Overview

A **systematic user activity logging system** has been implemented that:
1. ✅ Captures user login (Google OAuth username)
2. ✅ Logs ALL user actions on the website
3. ✅ Creates daily log files (format: `logs/username_YYYY-MM-DD.log`)
4. ✅ Provides activity history and statistics
5. ✅ Allows CSV export for audit trails

---

## 🏗️ Architecture

### System Flow
```
User Login (Google OAuth)
    ↓
Extract Username (email prefix)
    ↓
Set Auth Token in ActivityTracker
    ↓
User Actions (click, upload, view, etc.)
    ↓
ActivityTracker logs to Backend API
    ↓
Backend saves to log files
    ↓
Logs directory: trustvault/logs/
    - username_2026-01-17.log (daily files)
    - all_activities_2026-01-17.log (global activity log)
```

---

## 📁 Files Created

### Backend Files

#### 1. **backend/userActivityLogger.js** (355 lines)
Core logging module that:
- Creates log files in `logs/` directory
- Saves user activities with timestamp, action, and details
- Manages log rotation (90-day retention)
- Provides history and statistics queries
- Exports data to CSV format

**Key Functions:**
```javascript
logUserActivity(username, action, details)
getUserActivityHistory(username, days)
getUserActivityStats(username, days)
exportUserActivityToCSV(username, days)
cleanupOldLogs(retentionDays)
getAllActiveUsers()
```

#### 2. **backend/userActivityRoutes.js** (260 lines)
Express routes for activity logging API:

**Endpoints:**
- `POST /api/user/log-activity` - Log activity
- `GET /api/user/activity-history?days=30` - Get user history
- `GET /api/user/activity-stats?days=30` - Get statistics
- `GET /api/user/activity-export?days=30` - Export as CSV
- `POST /api/user/log-page-visit` - Log page visits
- `POST /api/user/log-evidence-action` - Log evidence actions
- `POST /api/user/log-blockchain-action` - Log blockchain actions
- `GET /api/admin/active-users` - Admin: list all users
- `POST /api/admin/cleanup-old-logs` - Admin: cleanup old logs

**Middleware:**
- `extractUsername` - Verifies Google OAuth token and extracts username

### Frontend Files

#### 3. **frontend/src/ActivityTracker.js** (220 lines)
Frontend utility class for activity logging:

**Key Methods:**
```javascript
setAuthToken(token)              // Set auth token after login
logActivity(action, details)     // Log any activity
logPageVisit(pagePath, title)    // Log page navigation
logEvidenceAction(action, id)    // Log evidence operations
logClick(elementId, class, text) // Log button/link clicks
logFileUpload(name, size, type)  // Log file uploads
getActivityHistory(days)         // Fetch activity history
getActivityStats(days)           // Get statistics
exportActivityToCSV(days)        // Export as CSV
setupAutoTracking()              // Setup automatic page tracking
```

#### 4. **frontend/src/UserActivityLog.jsx** (380 lines)
React component displaying activity log dashboard with:
- Statistics cards (total actions, active days, date range)
- Action type breakdown chart
- Filterable activity list with timestamps
- CSV export functionality
- Date range filtering (7, 30, 90, 365 days)
- Responsive design

#### 5. **frontend/src/UserActivityLog.css** (400+ lines)
Professional styling for the activity log dashboard

---

## 🚀 Implementation Steps

### Step 1: Login Integration
When user logs in with Google OAuth:

```javascript
// In Login.jsx, after successful OAuth:
import tracker from "./ActivityTracker";

// Set token in activity tracker
tracker.setAuthToken(googleIdToken);

// Log login action
tracker.logActivity("LOGIN", {
  email: userData.email,
  name: userData.name,
});
```

### Step 2: Integrate ActivityTracker into Components

#### **AddEvidence.jsx**
```javascript
import tracker from "../ActivityTracker";

// When evidence is uploaded
const handleUpload = async (evidence) => {
  // Log the action
  await tracker.logEvidenceAction("UPLOAD", evidence.id, {
    fileName: evidence.fileName,
    fileSize: evidence.fileSize,
  });
  
  // ... existing upload code ...
};
```

#### **ViewEvidence.jsx**
```javascript
// When evidence is viewed
useEffect(() => {
  const evidenceId = params.id;
  
  // Log page visit
  tracker.logPageVisit(`/view-evidence/${evidenceId}`, "View Evidence");
  
  // Log evidence view action
  tracker.logEvidenceAction("VIEW", evidenceId, {
    timestamp: new Date().toISOString(),
  });
}, []);
```

#### **BlockchainEvents.jsx**
```javascript
// When blockchain event is recorded
const handleBlockchainEvent = async (event) => {
  await tracker.logBlockchainAction("EVENT_RECORDED", {
    eventType: event.type,
    txHash: event.txHash,
  });
};
```

### Step 3: Add Activity Log Route to Navigation
Add link to `/activity-log` in your navigation menu:

```jsx
<Link to="/activity-log">📊 My Activity Log</Link>
```

---

## 📊 Log File Structure

### Location
```
trustvault/logs/
├── username_2026-01-17.log    # User's daily activity log
├── username_2026-01-16.log    # Previous day
└── all_activities_2026-01-17.log # Global activity log
```

### Format (JSON per line)
```json
{"timestamp":"2026-01-17T10:30:45.123Z","date":"2026-01-17","action":"PAGE_VISIT","details":{"pagePath":"/dashboard","pageTitle":"Dashboard","userAgent":"Mozilla/5.0...","ipAddress":"192.168.1.100"}}
{"timestamp":"2026-01-17T10:31:12.456Z","date":"2026-01-17","action":"EVIDENCE_UPLOAD","details":{"evidenceId":"hash123","fileName":"video.mp4","fileSize":5242880}}
{"timestamp":"2026-01-17T10:32:01.789Z","date":"2026-01-17","action":"BLOCKCHAIN_EVENT_RECORDED","details":{"eventType":"UPLOAD","txHash":"0x1234..."}}
```

---

## 🔌 Backend Integration

### Updated server.js
```javascript
// Load environment variables
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Import user activity routes
const userActivityRoutes = require("./userActivityRoutes");

// ... existing code ...

// Add activity logging routes to Express app
try {
  app.use(userActivityRoutes);
  console.log("✅ User activity logging routes initialized");
} catch (err) {
  console.warn("⚠️  User activity routes failed:", err.message);
}
```

---

## 📱 Frontend Integration

### Updated App.jsx
```jsx
import UserActivityLog from "./UserActivityLog";

// In Routes:
<Route path="/activity-log" element={<UserActivityLog authToken={userToken} />} />
<Route path="/user-activity" element={<UserActivityLog authToken={userToken} />} />
```

### In Login Component
```javascript
const handleLoginSuccess = (credentialResponse) => {
  // Decode token
  const userData = jwt_decode(credentialResponse.credential);
  
  // Set up activity tracking
  tracker.setAuthToken(credentialResponse.credential);
  
  // Log user login
  tracker.logActivity("USER_LOGIN", {
    email: userData.email,
    name: userData.name,
  });
  
  // Setup automatic page tracking
  tracker.setupAutoTracking();
};
```

---

## 🎯 Activity Types Logged

### User Actions
| Action | Logged When | Details |
|--------|-----------|---------|
| `LOGIN` | User logs in | Email, name |
| `PAGE_VISIT` | User navigates | Page path, title |
| `CLICK` | User clicks button/link | Element ID, text |
| `FORM_SUBMIT` | User submits form | Form name, fields |
| `SEARCH` | User searches | Query, results count |
| `ERROR` | Application error | Error message, stack |

### Evidence Actions
| Action | Logged When | Details |
|--------|-----------|---------|
| `EVIDENCE_UPLOAD` | Evidence uploaded | Evidence ID, file name, size |
| `EVIDENCE_VIEW` | Evidence viewed | Evidence ID |
| `EVIDENCE_VERIFY` | Evidence verified | Evidence ID, result |
| `EVIDENCE_TRANSFER` | Evidence transferred | From/to user |
| `EVIDENCE_EXPORT` | Evidence exported | Evidence ID, format |

### Blockchain Actions
| Action | Logged When | Details |
|--------|-----------|---------|
| `BLOCKCHAIN_UPLOAD` | Event logged on chain | TX hash |
| `BLOCKCHAIN_VIEW` | Events queried | Event count |
| `BLOCKCHAIN_EXPORT` | Events exported | Event count |

---

## 📊 Accessing Activity Data

### From Activity Log Dashboard
1. Navigate to `/activity-log`
2. View statistics dashboard
3. Filter by date range (7/30/90/365 days)
4. Filter by action type
5. Export to CSV

### From Backend API
```bash
# Get user's activity history (last 30 days)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5001/api/user/activity-history?days=30

# Get activity statistics
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5001/api/user/activity-stats?days=30

# Export as CSV
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5001/api/user/activity-export?days=30 > activity.csv

# Admin: Get all active users
curl http://localhost:5001/api/admin/active-users

# Admin: Cleanup logs older than 90 days
curl -X POST http://localhost:5001/api/admin/cleanup-old-logs \
  -H "Content-Type: application/json" \
  -d '{"retentionDays": 90}'
```

### From Log Files
```bash
# View today's activity for a user
cat logs/john_2026-01-17.log | jq '.'

# View global activity log
cat logs/all_activities_2026-01-17.log

# Count activities by user
grep -o '"username":"[^"]*"' logs/all_activities_*.log | sort | uniq -c

# Search for specific actions
grep EVIDENCE logs/john_2026-01-17.log

# Export to readable format
jq -r '[.timestamp, .action, .details] | @csv' logs/john_2026-01-17.log
```

---

## ⚙️ Configuration

### Environment Variables (backend/.env)
```
# Existing
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
RPC_URL=http://127.0.0.1:7545

# For activity logging
NODE_ENV=development
PORT=5001
```

### Log Retention Policy
- Daily log files per user
- Global activity log per day
- Automatic cleanup: logs older than 90 days
- Max file size: unlimited (use log rotation externally if needed)

---

## 🔒 Security Considerations

### Token Verification
- All activity endpoints verify Google OAuth token
- Username extracted from token payload (email prefix)
- Invalid tokens return 401 Unauthorized

### Data Privacy
- Only authenticated users can view their own logs
- Admin endpoints should be protected with additional authentication
- Logs contain no sensitive data (just action metadata)

### Log Access Control
- Log files stored in `trustvault/logs/`
- Ensure proper file permissions: `640`
- Restrict access to authorized personnel

---

## 📈 Monitoring & Analytics

### Activity Metrics
```javascript
// Get user activity patterns
tracker.getActivityStats(30).then(stats => {
  console.log("Total actions:", stats.stats.totalActions);
  console.log("Active days:", stats.stats.activeDays);
  console.log("Action breakdown:", stats.stats.actionCounts);
});
```

### Audit Trail
```javascript
// Get complete user activity trail
tracker.getActivityHistory(90).then(history => {
  // Use for compliance reporting
  // Track evidence chain of custody
  // Detect suspicious activity
});
```

---

## 🧪 Testing

### Test Activity Logging
```bash
# 1. Login user and note token
# 2. Navigate to different pages
# 3. Upload evidence
# 4. Check log file created:
ls -la logs/

# 5. View activities:
cat logs/username_2026-01-17.log | jq '.'

# 6. Test API endpoint:
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5001/api/user/activity-history

# 7. Check activity log dashboard:
# Navigate to http://localhost:3000/activity-log
```

---

## 🚀 Running the System

### Launch with `run.sh`
```bash
cd /Users/shanawaz/Desktop/GDG\ FInal/trustvault
bash run.sh
```

This will:
1. Start backend on port 5001
2. Start frontend on port 3000
3. Open Chrome to http://localhost:3000

### First-Time Use
1. Login with Google OAuth
2. ActivityTracker automatically initializes
3. Navigate to different pages
4. Check `/activity-log` to see dashboard
5. Review log files in `trustvault/logs/`

---

## 📞 Troubleshooting

### "Activity logging not authenticated"
- Ensure Google OAuth token is set
- Check: `tracker.setAuthToken(token)` called after login

### Log files not created
- Check directory permissions: `ls -la trustvault/logs/`
- Verify backend has write access
- Check backend logs for errors

### API returning 401
- Token may be expired
- Refresh page and re-login
- Check Authorization header format: `Bearer TOKEN`

### No activities showing in dashboard
- Wait 2-3 seconds after page load
- Check browser Network tab for API calls
- Verify /api/user/activity-history endpoint responding

---

## 📚 File Reference

```
trustvault/
├── backend/
│   ├── userActivityLogger.js     # Core logging module
│   ├── userActivityRoutes.js     # Express routes
│   └── server.js                 # Updated to include routes
├── frontend/src/
│   ├── ActivityTracker.js        # Frontend activity utility
│   ├── UserActivityLog.jsx       # Activity log dashboard
│   ├── UserActivityLog.css       # Dashboard styling
│   └── App.jsx                   # Updated with routes
└── logs/                         # Auto-created activity logs
    ├── username_YYYY-MM-DD.log   # Per-user daily logs
    └── all_activities_YYYY-MM-DD.log # Global activity log
```

---

## ✅ Checklist for Implementation

- [x] Backend logging module created
- [x] Backend API routes created
- [x] Frontend activity tracker utility created
- [x] Activity log dashboard component created
- [x] Dashboard styling created
- [x] Routes added to App.jsx
- [x] server.js updated to include routes
- [x] run.sh updated for Chrome launching
- [ ] Integrate tracker into AddEvidence.jsx
- [ ] Integrate tracker into ViewEvidence.jsx
- [ ] Integrate tracker into VerifyEvidence.jsx
- [ ] Integrate tracker into Login.jsx
- [ ] Integrate tracker into BlockchainEvents.jsx
- [ ] Test end-to-end logging flow
- [ ] Verify log files created
- [ ] Test activity dashboard

---

**Status**: ✅ System Ready for Integration

**Next Steps**: 
1. Run `bash run.sh` to start system
2. Login with Google OAuth
3. Navigate website
4. Visit http://localhost:3000/activity-log to view logs
5. Check `trustvault/logs/` directory for log files

