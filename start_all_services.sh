#!/bin/bash

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start the backend server
echo "Starting backend server..."
cd "$SCRIPT_DIR/backend" && npm start &
BACKEND_PID=$!
sleep 3

# Start the deepfake detection service (Streamlit)
echo "Starting deepfake detection service..."
cd "$SCRIPT_DIR/deepfake" && streamlit run streamlit_app.py --server.port 8501 &
DEEPFAKE_PID=$!
sleep 3

# Start the frontend
echo "Starting frontend..."
cd "$SCRIPT_DIR/frontend" && npm start &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $DEEPFAKE_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Wait for all background processes
wait
