# Deepfake Detection Integration Guide

## Overview
The deepfake detection feature has been integrated into the TrustVault frontend. Instead of viewing records on the landing page, users can now access an AI-powered deepfake detection system that launches the Streamlit app within the same interface.

## New Frontend Changes

### 1. New Components Created
- **DeepfakeDetection.jsx**: Main component that embeds the Streamlit app
- **DeepfakeDetection.css**: Styling for the deepfake detection interface

### 2. Updated Components
- **Home.jsx**: 
  - Replaced "view Records" button with "Deepfake Detection" button
  - Updated navigation to point to `/deepfake-detection` route
  
- **App.jsx**:
  - Added import for `DeepfakeDetection` component
  - Added new route: `<Route path="/deepfake-detection" element={<DeepfakeDetection />} />`

## Setup Instructions

### Prerequisites
1. Node.js and npm installed
2. Python 3.7+ with pip installed
3. All dependencies from `requirements.txt` in the deepfake directory installed

### Step 1: Install Deepfake Dependencies
```bash
cd deepfake
pip install -r requirements_simple.txt
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 3: Install Backend Dependencies
```bash
cd backend
npm install
```

## Running the Application

### Option 1: Start All Services at Once
```bash
bash start_all_services.sh
```
This will:
- Start the backend server on port 5001
- Start the Streamlit deepfake detection app on port 8501
- Start the React frontend on port 3000

### Option 2: Start Services Individually

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Deepfake Detection Service:**
```bash
cd deepfake
streamlit run streamlit_app.py --server.port 8501
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm start
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Click the **"Deepfake Detection"** button on the home page (replaces the previous "view Records" button)
3. The Streamlit app will load in an iframe on the same page
4. Upload a video file (mp4, avi, mov)
5. Click **"Run Deepfake Detection"** to analyze the video
6. View the results showing:
   - Average Fake Probability score
   - Number of frames analyzed
   - REAL or FAKE verdict

## Technical Details

### How It Works
1. The React component (`DeepfakeDetection.jsx`) embeds the Streamlit app using an iframe
2. The iframe connects to `http://localhost:8501` where the Streamlit server runs
3. Users interact with the Streamlit interface directly within the React app
4. The deepfake detection model processes videos using the Meso4 classifier

### Streamlit App Features
- **Video Upload**: Supports mp4, avi, and mov formats
- **Real-time Processing**: Shows progress bar during analysis
- **Frame Analysis**: Processes every 10th frame for optimal speed
- **Accuracy Scoring**: Provides probability score and final verdict

### Error Handling
If the Streamlit service is not running, the user will see:
- A warning message explaining the service is unavailable
- Instructions to start the Streamlit app
- Command to run: `streamlit run streamlit_app.py`

## Troubleshooting

### Streamlit App Not Loading
- Ensure Streamlit is running on port 8501
- Check that Python dependencies are installed: `pip install -r requirements_simple.txt`
- Verify the Meso4_DF.h5 weights file exists in `deepfake/weights/`

### CORS Issues
- The iframe uses `allow="*"` for maximum compatibility
- If CORS is still an issue, ensure Streamlit is running locally

### Performance Issues
- The Streamlit app processes every 10th frame for speed optimization
- For faster analysis, smaller video files are recommended
- GPU support can be enabled if available

## Model Information

### Meso4 Classifier
- Specialized deep learning model for deepfake detection
- Trained on deepfake detection datasets
- Processes video frames and provides probability scores
- Score > 0.5 indicates FAKE, ≤ 0.5 indicates REAL

## File Structure
```
trustvault/
├── frontend/
│   ├── src/
│   │   ├── DeepfakeDetection.jsx (NEW)
│   │   ├── DeepfakeDetection.css (NEW)
│   │   ├── Home.jsx (UPDATED)
│   │   ├── App.jsx (UPDATED)
│   │   └── ...
│   └── package.json
├── deepfake/
│   ├── streamlit_app.py
│   ├── classifiers.py
│   ├── weights/
│   │   ├── Meso4_DF.h5
│   │   ├── Meso4_F2F.h5
│   │   ├── MesoInception_DF.h5
│   │   └── MesoInception_F2F.h5
│   └── requirements_simple.txt
├── backend/
│   └── ...
└── start_all_services.sh (NEW)
```

## Notes
- The deepfake detection service runs independently on port 8501
- It can also be accessed directly at `http://localhost:8501` if needed
- The Streamlit app can be stopped without affecting the React frontend
- To stop all services, use `Ctrl+C` on the terminal running the startup script
