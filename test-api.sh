#!/bin/bash

# Test Blockchain API Endpoints
set -e

BASE_URL="http://localhost:5001"

echo "🧪 Testing Blockchain API Endpoints"
echo "===================================="
echo ""

# Test 1: Health check
echo "1️⃣  Testing Health Check..."
curl -X GET "$BASE_URL/health" -H "Content-Type: application/json" 2>/dev/null | jq '.' 2>/dev/null || echo "❌ Health check failed"
echo ""

# Test 2: Evidence Events (should work without auth)
echo "2️⃣  Testing Evidence Events History (EV-001)..."
curl -X GET "$BASE_URL/api/blockchain/evidence-events/EV-001" -H "Content-Type: application/json" 2>/dev/null | jq '.' 2>/dev/null || echo "❌ Evidence events failed"
echo ""

# Test 3: Check records
echo "3️⃣  Testing Records Endpoint..."
curl -X GET "$BASE_URL/records" -H "Content-Type: application/json" 2>/dev/null | jq '.' 2>/dev/null || echo "❌ Records endpoint failed or no data"
echo ""

echo "✅ API tests completed"
