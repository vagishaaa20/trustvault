#!/bin/bash

echo "🔍 Diagnosing TrustVault Upload Issues..."
echo ""

# Check if Ganache is running
echo "1. Checking Ganache (Port 7545)..."
if nc -z localhost 7545 2>/dev/null; then
    echo "   ✅ Ganache is running"
else
    echo "   ❌ Ganache is NOT running on port 7545"
    echo "   💡 Start Ganache with: npm run ganache"
fi

echo ""

# Check if Backend is running
echo "2. Checking Backend Server (Port 5001)..."
if nc -z localhost 5001 2>/dev/null; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is NOT running on port 5001"
    echo "   💡 Start Backend with: cd backend && npm start"
fi

echo ""

# Check if Frontend is running
echo "3. Checking Frontend (Port 3000)..."
if nc -z localhost 3000 2>/dev/null; then
    echo "   ✅ Frontend is running"
else
    echo "   ❌ Frontend is NOT running on port 3000"
    echo "   💡 Start Frontend with: cd frontend && npm start"
fi

echo ""

# Check if uploads directory exists
echo "4. Checking uploads directory..."
if [ -d "backend/uploads" ]; then
    echo "   ✅ Upload directory exists"
    echo "   📁 Contents:"
    ls -lah backend/uploads/ | head -10
else
    echo "   ❌ Upload directory does not exist"
    echo "   💡 Creating directory..."
    mkdir -p backend/uploads
fi

echo ""

# Check compiled contract
echo "5. Checking contract compilation..."
if [ -f "compiled_code.json" ]; then
    echo "   ✅ compiled_code.json exists"
else
    echo "   ❌ compiled_code.json NOT found"
    echo "   💡 Run: npm run compile-contract"
fi

echo ""

# Check if Python can import web3
echo "6. Checking Python environment..."
python3 -c "from web3 import Web3; print('   ✅ Web3 module available')" 2>/dev/null || echo "   ❌ Web3 module not available - run: pip install web3"

echo ""
echo "✅ Diagnostics complete!"
