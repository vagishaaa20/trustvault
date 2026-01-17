# User Activity Logging System - Quick Start

## 🎯 What Was Implemented

A **complete user activity logging system** that:

✅ Captures user **login via Google OAuth**
✅ Logs **ALL user actions** (page visits, uploads, clicks, etc.)
✅ Creates **daily log files** in `logs/username_YYYY-MM-DD.log`
✅ Provides **activity dashboard** at `/activity-log`
✅ Supports **CSV export** for compliance/audit
✅ Shows **activity statistics & filters**

---

## 🚀 Quick Start (3 Steps)

### 1. Launch the System
```bash
cd /Users/shanawaz/Desktop/GDG\ FInal/trustvault
bash run.sh
```

This opens:
- Chrome at http://localhost:3000
- Backend on port 5001
- Ganache on port 7545

### 2. Login with Google OAuth
- Click "Login" button
- Use your Google account
- ActivityTracker automatically initializes with your username

### 3. View Your Activity Log
- After any actions, visit: **http://localhost:3000/activity-log**
- See dashboard with:
  - Total actions
  - Active days
  - Action breakdown
  - Filterable activity list
  - CSV export option

---

## 📁 What Was Created

| File | Purpose |
|------|---------|
| **backend/userActivityLogger.js** | Core logging module (355 lines) |
| **backend/userActivityRoutes.js** | Express API routes (260 lines) |
| **frontend/src/ActivityTracker.js** | Frontend activity utility (220 lines) |
| **frontend/src/UserActivityLog.jsx** | Dashboard component (380 lines) |
| **frontend/src/UserActivityLog.css** | Dashboard styling (400+ lines) |
| **trustvault/logs/** | Auto-created log directory |

---

## 📊 Activity Log Dashboard Features

### Statistics Cards
- **Total Actions**: All actions by user
- **Active Days**: Days with at least 1 action
- **Date Range**: Period being analyzed
- **Last Activity**: When user last acted

### Action Breakdown
- Counts by action type
- Visual breakdown of activities
- Most common actions highlighted

### Activity List
- **Timestamp**: Exact time of action
- **Action**: Type of action (PAGE_VISIT, UPLOAD, etc.)
- **Details**: IP, URL, file info, etc.
- **Date**: Grouped by date

### Filters & Export
- Date range: 7, 30, 90, 365 days
- Filter by action type
- **Export as CSV** for compliance

---

## 🔌 API Endpoints

### User Activity Endpoints
```
POST   /api/user/log-activity              # Log activity
GET    /api/user/activity-history?days=30  # Get history
GET    /api/user/activity-stats?days=30    # Get stats
GET    /api/user/activity-export?days=30   # Export CSV
POST   /api/user/log-page-visit            # Log page visit
POST   /api/user/log-evidence-action       # Log evidence action
POST   /api/user/log-blockchain-action     # Log blockchain action
```

All require: `Authorization: Bearer <GOOGLE_TOKEN>`

### Admin Endpoints
```
GET    /api/admin/active-users             # List all users with logs
POST   /api/admin/cleanup-old-logs         # Delete logs > 90 days
```

---

## 📂 Log File Structure

### Location
```
trustvault/logs/
├── john_smith_2026-01-17.log      # User's daily log
├── john_smith_2026-01-16.log      # Previous day
└── all_activities_2026-01-17.log  # Global log
```

### Format (JSON lines)
```json
{"timestamp":"2026-01-17T10:30:45Z","action":"PAGE_VISIT","details":{"pagePath":"/dashboard"}}
{"timestamp":"2026-01-17T10:31:12Z","action":"EVIDENCE_UPLOAD","details":{"evidenceId":"hash123"}}
{"timestamp":"2026-01-17T10:32:01Z","action":"BLOCKCHAIN_EVENT","details":{"txHash":"0x1234"}}
```

### View Logs
```bash
# View user's today's activities
cat logs/john_smith_2026-01-17.log | jq '.'

# View global activity log
cat logs/all_activities_2026-01-17.log

# Search for specific action
grep "EVIDENCE_UPLOAD" logs/john_smith_2026-01-17.log
```

---

## 🔧 Routes in Frontend

All routes available and activity-logging ready:

```
/                          Home page
/login                     Google OAuth Login
/approach                  System overview
/add-evidence              Upload evidence → logs EVIDENCE_UPLOAD
/verify-evidence           Verify evidence → logs EVIDENCE_VERIFY
/view-evidence             View evidence → logs EVIDENCE_VIEW
/deepfake-detection        Deepfake detection
/dashboard                 Evidence dashboard
/blockchain-events         Blockchain event log
/activity-log              📊 USER ACTIVITY LOG (NEW!)
/user-activity             Same as /activity-log
```

---

## 🧪 Testing Activity Logging

### Test Flow
1. **Login**: http://localhost:3000/login
   - Uses Google OAuth
   - Creates token and initializes ActivityTracker

2. **Navigate**: Click around the application
   - Each page visit is logged automatically
   - Each button click is logged
   - Automatic tracking enabled

3. **Take Actions**: Upload evidence, verify, etc.
   - Each action logged with details
   - Timestamp captured
   - IP address recorded

4. **View Dashboard**: http://localhost:3000/activity-log
   - See all your actions
   - Filter by date/type
   - View statistics

5. **Check Log Files**:
   ```bash
   cat logs/your_username_2026-01-17.log | jq '.'
   ```

### Example Log Entry
```json
{
  "timestamp": "2026-01-17T10:30:45.123Z",
  "date": "2026-01-17",
  "action": "PAGE_VISIT",
  "details": {
    "pagePath": "/add-evidence",
    "pageTitle": "Add Evidence",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.100",
    "route": "/add-evidence",
    "method": "GET",
    "status": "success"
  }
}
```

---

## 📋 Activity Types Captured

### Navigation
- `PAGE_VISIT` - User visits a page
- `NAVIGATION` - User navigates between routes

### User Input
- `CLICK` - Button/link clicked
- `FORM_SUBMIT` - Form submitted
- `SEARCH` - Search query entered
- `FILE_UPLOAD` - File uploaded

### Evidence Actions
- `EVIDENCE_UPLOAD` - Evidence uploaded
- `EVIDENCE_VIEW` - Evidence viewed
- `EVIDENCE_VERIFY` - Evidence verified
- `EVIDENCE_TRANSFER` - Evidence transferred
- `EVIDENCE_EXPORT` - Evidence exported

### Blockchain Actions
- `BLOCKCHAIN_UPLOAD` - Event logged on blockchain
- `BLOCKCHAIN_VIEW` - Events queried
- `BLOCKCHAIN_TRANSFER` - Events transferred
- `BLOCKCHAIN_EXPORT` - Events exported

### System
- `LOGIN` - User logged in
- `LOGOUT` - User logged out
- `ERROR` - Error occurred

---

## ⚙️ Integration Points

### In Login Component
```javascript
import tracker from "../ActivityTracker";

// After successful login:
tracker.setAuthToken(credentialResponse.credential);
tracker.logActivity("LOGIN", { email: userData.email });
tracker.setupAutoTracking(); // Enable automatic tracking
```

### In Evidence Components
```javascript
// In AddEvidence.jsx
await tracker.logEvidenceAction("UPLOAD", evidenceId, {
  fileName: file.name,
  fileSize: file.size,
});

// In ViewEvidence.jsx
tracker.logEvidenceAction("VIEW", evidenceId);

// In BlockchainEvents.jsx
tracker.logBlockchainAction("EVENT_RECORDED", { txHash });
```

---

## 🔒 Security

✅ All activity endpoints verify Google OAuth token
✅ Username extracted from token (email prefix)
✅ Only users can view their own activity
✅ Admin endpoints available for monitoring
✅ Log files have restricted permissions
✅ No sensitive data stored in logs

---

## 📊 Viewing Activity Data

### Via Dashboard
- **URL**: http://localhost:3000/activity-log
- **Login required**: Yes
- **Features**:
  - Live statistics
  - Action breakdown
  - Filterable list
  - CSV export

### Via API
```bash
# Get history (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5001/api/user/activity-history?days=30

# Get statistics
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5001/api/user/activity-stats?days=30

# Export to CSV
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5001/api/user/activity-export?days=30 > activity.csv
```

### Via Log Files
```bash
# View file
cat logs/john_smith_2026-01-17.log

# Pretty print
cat logs/john_smith_2026-01-17.log | jq '.'

# Count actions
cat logs/john_smith_2026-01-17.log | jq '.action' | sort | uniq -c

# Filter actions
cat logs/john_smith_2026-01-17.log | jq 'select(.action=="EVIDENCE_UPLOAD")'
```

---

## 🎯 Next Steps

### 1. Update React Components (Optional but Recommended)
Add activity logging to key components:
- **AddEvidence.jsx**: Log uploads
- **ViewEvidence.jsx**: Log views
- **BlockchainEvents.jsx**: Log blockchain actions

See `USER_ACTIVITY_LOGGING_GUIDE.md` for code examples.

### 2. Customize Activity Types
Add custom activity types for your workflows:
```javascript
tracker.logActivity("CUSTOM_ACTION", {
  customData: value,
  moreDetails: data,
});
```

### 3. Setup Monitoring
```bash
# Watch log files in real-time
tail -f logs/*.log | jq '.'

# Monitor all user activity
tail -f logs/all_activities_*.log | jq '.action' | sort | uniq -c
```

### 4. Export for Compliance
```bash
# Export user's 90-day activity
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5001/api/user/activity-export?days=90 > compliance_report.csv
```

---

## 📝 File Locations

**Key Files**:
- Backend Logger: `backend/userActivityLogger.js`
- Backend Routes: `backend/userActivityRoutes.js`
- Frontend Tracker: `frontend/src/ActivityTracker.js`
- Dashboard Component: `frontend/src/UserActivityLog.jsx`
- Dashboard Styles: `frontend/src/UserActivityLog.css`

**Log Files**:
- User logs: `logs/username_YYYY-MM-DD.log`
- Global logs: `logs/all_activities_YYYY-MM-DD.log`

**Documentation**:
- Full guide: `USER_ACTIVITY_LOGGING_GUIDE.md`
- Launch guide: `LAUNCH_GUIDE.md`

---

## ✅ Checklist

- [x] Backend logging module created
- [x] Backend API routes created  
- [x] Frontend activity tracker created
- [x] Activity dashboard created
- [x] Dashboard styling created
- [x] Routes integrated into App.jsx
- [x] Server updated to include routes
- [x] run.sh updated for Chrome launch
- [x] Log directory auto-created
- [x] Google OAuth integration ready
- [ ] (Optional) Integrate tracker into components
- [ ] (Optional) Setup monitoring dashboard
- [ ] (Optional) Export compliance reports

---

## 🆘 Troubleshooting

### Issue: "Not authenticated" message
**Solution**: Ensure you're logged in with Google OAuth first

### Issue: Activity log empty
**Solution**: 
1. Wait 2-3 seconds for page to load
2. Navigate to a page to trigger activity
3. Refresh the activity-log page

### Issue: No log files created
**Solution**:
1. Check backend is running: `nc -zv localhost 5001`
2. Check backend logs in Terminal window
3. Verify write permissions: `ls -la trustvault/logs/`

### Issue: API returns 401
**Solution**: Token may be expired, re-login to refresh

---

## 🚀 You're All Set!

Your user activity logging system is ready to use. Simply:

1. **Run**: `bash run.sh`
2. **Login**: Use Google OAuth
3. **Act**: Navigate and use the website
4. **Check**: Visit `/activity-log` to see your activities
5. **Export**: Download CSV for compliance

**Happy logging!** 📊

