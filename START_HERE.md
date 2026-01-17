# 🚀 TrustVault - Quick Start Guide

## One-Command Startup

The system now has a **unified startup script** that launches everything automatically.

### Quick Start (Recommended)

```bash
cd /Users/shanawaz/Desktop/GDG\ FInal/trustvault
bash start.sh
```

That's it! The script will:
- ✅ Setup all configurations
- ✅ Install dependencies (if needed)
- ✅ Start Backend (port 5001)
- ✅ Start Frontend (port 3000)
- ✅ Open Chrome automatically
- ✅ Display all available routes

### What Happens

1. **Backend starts** on `http://localhost:5001`
2. **Frontend compiles** and starts on `http://localhost:3000`
3. **Chrome opens** automatically
4. **Activity tracking** begins after you login with Google OAuth

### Using the Website

1. **Login**: Click the "Login" button and authenticate with Google
2. **Perform Actions**: Upload evidence, verify, navigate, etc.
3. **View Activity Log**: Visit `http://localhost:3000/activity-log`
4. **See Your Activity**: All your actions are tracked with timestamps

### Available Routes

| Route | Purpose |
|-------|---------|
| `/` | Home Page |
| `/login` | Google OAuth Login |
| `/add-evidence` | Upload Evidence (Activity: EVIDENCE_UPLOAD) |
| `/verify-evidence` | Verify Evidence (Activity: EVIDENCE_VERIFY) |
| `/view-evidence` | View Evidence (Activity: EVIDENCE_VIEW) |
| `/activity-log` | **User Activity Dashboard** ⭐ |
| `/dashboard` | Evidence Dashboard |
| `/blockchain-events` | Blockchain Event Log |

### Activity Tracking

The system automatically tracks:
- 📄 Page visits
- 🖱️ Clicks
- 📤 File uploads
- ✓ Evidence actions
- ❌ Errors
- ⏱️ Timestamps

All activities are stored in: `trustvault/logs/`

### Stop the System

Press `Ctrl+C` in the terminal to gracefully stop all services.

### Troubleshooting

**Frontend compiling slowly?**
- This is normal on first run. Wait 10-15 seconds for compilation.

**Chrome won't open?**
- The services are still running. Manually open `http://localhost:3000` in your browser.

**Backend not responding?**
- Check if port 5001 is available: `lsof -i :5001`
- Kill process if needed: `kill -9 <PID>`

**Frontend port already in use?**
- Check port 3000: `lsof -i :3000`
- Kill process: `kill -9 <PID>`

### Scripts Included

| Script | Purpose |
|--------|---------|
| `start.sh` | **NEW: Unified launcher (USE THIS)** |
| `quick-start.sh` | Simple frontend/backend launcher |
| `run.sh` | Original complex script (legacy) |

---

**Recommended:** Always use `bash start.sh` for the best experience!
