# 🎯 TrustVault - Complete Unified Launcher

## ✅ What's New

You now have a **single, unified startup script** that handles everything:

```bash
bash start.sh
```

### This Single Command Does:
✅ Verifies all directories exist  
✅ Creates/configures `.env` files  
✅ Installs dependencies (if needed)  
✅ Creates logs directory  
✅ Starts Backend server (port 5001)  
✅ Starts Frontend app (port 3000)  
✅ Waits for services to be ready  
✅ Opens Chrome automatically  
✅ Displays complete startup info  

---

## 🚀 Quick Start

### Step 1: Open Terminal
```bash
cd /Users/shanawaz/Desktop/GDG\ FInal/trustvault
```

### Step 2: Launch Everything
```bash
bash start.sh
```

### Step 3: Wait ~15 seconds
- Backend starts
- Frontend compiles
- Chrome opens

### Step 4: Login & Use
- Click "Login" button
- Authenticate with Google OAuth
- Activity tracking starts automatically

---

## 📍 Access Points

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:5001 |
| **Activity Dashboard** ⭐ | http://localhost:3000/activity-log |
| **Health Check** | http://localhost:5001/health |

---

## 🎯 Full Feature List

### Automatic
- ✅ Google OAuth authentication
- ✅ Activity tracking on login
- ✅ Page visit logging
- ✅ Click event capture
- ✅ File upload tracking
- ✅ Error logging
- ✅ Timestamp recording

### Manual Access
- ✅ View activity dashboard
- ✅ Filter by date range (7/30/90/365 days)
- ✅ Filter by action type
- ✅ Export to CSV
- ✅ View statistics
- ✅ See activity timeline

### Admin Features
- ✅ View all active users
- ✅ Automatic log cleanup (90 days)
- ✅ Health monitoring

---

## 📊 Activity Tracking

Every action is logged to: `trustvault/logs/`

### Log File Format
- **User logs**: `username_YYYY-MM-DD.log`
- **Global log**: `all_activities_YYYY-MM-DD.log`
- **Format**: JSON (one per line)

### View Logs
```bash
# View today's global activity log
tail -f logs/all_activities_*.log | jq '.'

# View specific user's activity
cat logs/john_smith_2026-01-17.log | jq '.'

# Count activities
wc -l logs/all_activities_*.log
```

---

## 🔧 Configuration

### Backend (.env)
Located at: `backend/.env`
```
CONTRACT_ADDRESS=0xD9aC54C760a12487c5C2865Face64a1F2D38445C
RPC_URL=http://127.0.0.1:7545
PORT=5001
NODE_ENV=development
```

### Frontend (.env)
Located at: `frontend/.env`
```
REACT_APP_BACKEND_URL=http://localhost:5001
REACT_APP_API_URL=http://localhost:5001/api
HOST=localhost
PORT=3000
```

---

## 🛑 Stopping Services

### Method 1: Terminal
Press `Ctrl+C` in the terminal running `start.sh`

### Method 2: Force Kill
```bash
pkill -f "node"
pkill -f "npm"
```

### Method 3: Activity Monitor
Open Activity Monitor, search for "node", force quit

---

## 📱 Available Routes

### Public Routes
- `/` - Home page
- `/login` - Google OAuth login
- `/approach` - System documentation

### Authenticated Routes
- `/add-evidence` - Upload evidence (tracked)
- `/verify-evidence` - Verify evidence (tracked)
- `/view-evidence` - View evidence (tracked)
- `/dashboard` - Evidence dashboard
- `/blockchain-events` - Blockchain log
- `/activity-log` ⭐ - **User activity dashboard**
- `/user-activity` - Alias for activity-log

---

## 🔍 Activity Types

All tracked activities include:
- **Timestamp** - ISO 8601 format
- **Action Type** - PAGE_VISIT, CLICK, EVIDENCE_UPLOAD, etc.
- **Details** - User agent, IP, route, file info, etc.
- **Status** - success, error, pending

### Common Activity Types
| Type | Description |
|------|-------------|
| `PAGE_VISIT` | User navigated to page |
| `CLICK` | Button/link clicked |
| `FILE_UPLOAD` | File selected for upload |
| `EVIDENCE_UPLOAD` | Evidence uploaded successfully |
| `EVIDENCE_VIEW` | Evidence viewed |
| `EVIDENCE_VERIFY` | Evidence verification performed |
| `FORM_SUBMIT` | Form submitted |
| `ERROR` | Error occurred |
| `LOGIN` | User logged in |
| `LOGOUT` | User logged out |

---

## 📈 Dashboard Features

### Statistics Cards
- **Total Actions** - Count of all user activities
- **Active Days** - Days user has been active
- **Last Activity** - Most recent action timestamp
- **Date Range** - First and last action dates

### Activity List
- **Sortable** - Sort by date, action type
- **Filterable** - Filter by date range, action type
- **Paginated** - 10 items per page
- **Timestamps** - Human-readable format

### Export Options
- **CSV Export** - Download activity history
- **Date Range** - 7, 30, 90, 365 days
- **Action Type** - Filter specific activities

---

## 🐛 Troubleshooting

### Issue: "Cannot find module"
**Solution**: Dependencies weren't installed
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Issue: Port 3000/5001 already in use
**Solution**: Kill existing processes
```bash
lsof -i :3000  # Find process
kill -9 <PID>  # Kill it
```

### Issue: Frontend shows blank page
**Solution**: Wait for compilation (10-15 seconds on first run)

### Issue: Activity log is empty
**Solution**: 
1. Make sure you're logged in with Google OAuth
2. Perform an action (navigate, click)
3. Wait 2 seconds
4. Refresh the page

### Issue: Chrome won't open
**Solution**: Manually navigate to http://localhost:3000

---

## 🎁 Bonus: Setup Aliases

Add to your `~/.zshrc` or `~/.bashrc`:
```bash
source /Users/shanawaz/Desktop/GDG\ FInal/trustvault/aliases.sh
```

Then use:
```bash
trustvault  # Launch everything
tvault      # Quick alias
tv          # Even quicker
```

---

## 📁 File Structure

```
trustvault/
├── start.sh                 # ⭐ USE THIS - Unified launcher
├── quick-start.sh          # Alternative launcher
├── run.sh                  # Legacy launcher
├── START_HERE.md           # Quick start guide
├── UNIFIED_LAUNCHER.md     # This file
├── aliases.sh              # Bash aliases
├── backend/
│   ├── .env                # Configuration
│   ├── package.json
│   ├── server.js
│   ├── userActivityLogger.js
│   └── userActivityRoutes.js
├── frontend/
│   ├── .env                # Configuration
│   ├── package.json
│   ├── src/
│   │   ├── ActivityTracker.js
│   │   ├── UserActivityLog.jsx
│   │   └── UserActivityLog.css
│   └── public/
└── logs/                   # Activity logs (auto-created)
    ├── username_YYYY-MM-DD.log
    └── all_activities_YYYY-MM-DD.log
```

---

## ✨ Performance Tips

### First Run
- Allow 15-20 seconds for full startup
- Frontend compilation takes time on first run

### Subsequent Runs
- Should start in 5-10 seconds
- Services start faster with cached dependencies

### Optimization
- Make sure 500MB+ disk space available
- Close other heavy applications
- Use modern Chrome browser

---

## 🎓 Learning Resources

### Understanding Activity Logs
1. Check `logs/all_activities_*.log` to see raw data
2. Visit `/activity-log` to see formatted view
3. Export to CSV for analysis

### Testing Features
1. Upload evidence → tracked as `EVIDENCE_UPLOAD`
2. Click buttons → tracked as `CLICK`
3. Navigate pages → tracked as `PAGE_VISIT`
4. Verify evidence → tracked as `EVIDENCE_VERIFY`

### Debugging
```bash
# Check backend health
curl http://localhost:5001/health

# Get your activity history
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5001/api/user/activity-history?days=7

# Export your activities
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5001/api/user/activity-export?days=30 > activities.csv
```

---

## 🎯 Next Steps

1. **Run the launcher**: `bash start.sh`
2. **Wait for services**: ~15 seconds
3. **Login**: Click login button
4. **Use the website**: Perform actions
5. **View dashboard**: Visit `/activity-log`
6. **Export data**: Click export button
7. **Analyze**: Study your activity patterns

---

## ❓ FAQ

**Q: Do I need Ganache running?**
A: No! The unified launcher doesn't require Ganache. The system works standalone.

**Q: Can I run this on Windows/Linux?**
A: The script is macOS-specific (uses `open` command). On Linux/Windows, manually open `http://localhost:3000`.

**Q: How long does it take to start?**
A: First run: 15-20 seconds. Subsequent runs: 5-10 seconds.

**Q: Can I modify the port numbers?**
A: Yes, edit `frontend/.env` and `backend/.env` to change PORT values.

**Q: Are my activities private?**
A: Activities are tracked per-user. Users can only view their own activity log.

**Q: How long are logs kept?**
A: Logs are automatically deleted after 90 days. Edit `userActivityLogger.js` to change retention.

---

**🎉 You're all set! Run `bash start.sh` to get started.**
