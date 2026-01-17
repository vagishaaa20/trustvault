# Frontend & API Access - Setup & Troubleshooting

## ✅ What Was Fixed

### 1. **Backend Blockchain Routes** 
Added blockchain API routes to `backend/server.js`:
- ✅ `POST /api/blockchain/log-upload`
- ✅ `POST /api/blockchain/log-view`
- ✅ `POST /api/blockchain/log-transfer`
- ✅ `POST /api/blockchain/log-export`
- ✅ `GET /api/blockchain/user-events`
- ✅ `GET /api/blockchain/evidence-events/:evidenceId`

### 2. **Frontend Proxy Configuration**
Added to `frontend/package.json`:
```json
"proxy": "http://localhost:5001"
```

This allows frontend to make API calls to backend without CORS issues.

### 3. **Frontend Environment Variables**
Created `frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:5001
REACT_APP_API_URL=http://localhost:5001/api
```

## 🚀 How to Run Everything

### Option 1: Complete Setup with run.sh

```bash
cd /Users/shanawaz/Desktop/GDG\ FInal/trustvault

# 1. Start Ganache in one terminal
ganache-cli

# 2. Run everything in another terminal
bash run.sh
```

### Option 2: Manual Setup

```bash
# Terminal 1: Start Ganache
ganache-cli

# Terminal 2: Deploy contract & install dependencies
cd /Users/shanawaz/Desktop/GDG\ FInal/trustvault
npx truffle compile
npx truffle migrate --network ganache

# Terminal 3: Start Backend
cd backend
npm install  # if needed
npm start

# Terminal 4: Start Frontend
cd frontend
npm install  # if needed
npm start

# Terminal 5: Start Deepfake (optional)
cd deepfake
source venv/bin/activate
streamlit run streamlit_app.py --server.port 8501
```

## 🔗 Access Your Services

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3000 | Should show TrustVault UI |
| Backend API | http://localhost:5001 | Should respond to requests |
| Backend Health | http://localhost:5001/health | Returns `{"status":"ok"}` |
| Blockchain Events | http://localhost:5001/api/blockchain/evidence-events/EV-001 | Event history |
| Deepfake Detection | http://localhost:8501 | Optional Streamlit app |
| Ganache | http://localhost:7545 | Blockchain UI |

## 🧪 Test the API

### Test without authentication (public endpoints):
```bash
# Test health
curl http://localhost:5001/health

# Test evidence events (public)
curl http://localhost:5001/api/blockchain/evidence-events/EV-001
```

### Test with authentication (requires Google OAuth token):
```bash
# Replace GOOGLE_TOKEN with actual token
TOKEN="YOUR_GOOGLE_OAUTH_TOKEN"

# Log upload event
curl -X POST http://localhost:5001/api/blockchain/log-upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"evidenceId":"EV-001","hash":"abc123"}'

# Get user events
curl -X GET http://localhost:5001/api/blockchain/user-events \
  -H "Authorization: Bearer $TOKEN"
```

## 🆘 Troubleshooting

### Issue: Frontend shows blank page at http://localhost:3000

**Solutions**:
1. ✅ Check browser console for errors
2. ✅ Verify `npm start` completed successfully
3. ✅ Check backend is running: `curl http://localhost:5001/health`
4. ✅ Clear browser cache: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
5. ✅ Kill and restart: `pkill -f "react-scripts"` then `npm start`

### Issue: "Cannot GET /api/blockchain/*" error

**Solutions**:
1. ✅ Ensure `backend/blockchainRoutes.js` exists
2. ✅ Ensure `backend/blockchainEvents.js` exists
3. ✅ Check backend started without errors
4. ✅ Verify routes are added to `server.js`
5. ✅ Restart backend: `npm start` in backend folder

### Issue: CORS errors in browser console

**Solutions**:
1. ✅ Check frontend has `"proxy": "http://localhost:5001"` in package.json
2. ✅ Restart frontend: `npm start` in frontend folder
3. ✅ Ensure backend CORS is enabled in server.js
4. ✅ Test API directly: `curl http://localhost:5001/api/blockchain/evidence-events/EV-001`

### Issue: "Port already in use" error

**Solutions**:
```bash
# Kill process on port 3000 (frontend)
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 5001 (backend)
lsof -i :5001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 8501 (deepfake)
lsof -i :8501 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 7545 (Ganache)
lsof -i :7545 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

## 📝 Expected Logs

### Backend Startup (should see):
```
✅ Blockchain event logging routes initialized
Backend running on http://0.0.0.0:5001
Access locally: http://localhost:5001
```

### Frontend Startup (should see):
```
On Your Network: http://192.168.x.x:3000
Compiled successfully!
```

## 🔍 Verify Setup

Run the test script:
```bash
bash /Users/shanawaz/Desktop/GDG\ FInal/trustvault/test-api.sh
```

Should output:
- ✅ Health check response
- ✅ Evidence events endpoint response
- ✅ Records endpoint response

## 📚 Next Steps

1. **Access frontend**: http://localhost:3000
2. **Upload evidence** using the UI
3. **Check blockchain logs** at: http://localhost:5001/api/blockchain/evidence-events/YOUR_EVIDENCE_ID
4. **View event history** in blockchain

## 🎯 Common Commands

```bash
# Restart everything
pkill -f "npm start"
pkill -f "streamlit"
pkill -f "ganache"

# Check if ports are open
lsof -i :3000  # Frontend
lsof -i :5001  # Backend
lsof -i :8501  # Deepfake
lsof -i :7545  # Ganache

# View backend logs
cd backend && npm start

# View frontend logs
cd frontend && npm start

# View Ganache logs
ganache-cli
```

---

**Status**: ✅ **Ready to Test**

All components are set up and ready to use!
