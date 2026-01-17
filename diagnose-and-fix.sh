#!/bin/bash

# 🔍 TrustVault - Diagnostic & Auto-Fix Script
# Helps identify and fix the PRIVATE_KEY error

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔍 TrustVault - Diagnostic Report${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# 1. Check .env exists
echo -e "${BLUE}Checking backend/.env...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ backend/.env exists${NC}"
echo ""

# 2. Extract values
echo -e "${BLUE}Reading configuration...${NC}"
PRIVATE_KEY=$(grep "PRIVATE_KEY=" backend/.env | cut -d'=' -f2 | tr -d ' ')
CONTRACT_ADDRESS=$(grep "CONTRACT_ADDRESS=" backend/.env | cut -d'=' -f2 | tr -d ' ')
RPC_URL=$(grep "RPC_URL=" backend/.env | cut -d'=' -f2 | tr -d ' ')

echo "  PRIVATE_KEY: ${PRIVATE_KEY:0:10}...${PRIVATE_KEY: -4}"
echo "  CONTRACT_ADDRESS: ${CONTRACT_ADDRESS:0:10}...${CONTRACT_ADDRESS: -4}"
echo "  RPC_URL: $RPC_URL"
echo ""

# 3. Validate PRIVATE_KEY
echo -e "${BLUE}Validating PRIVATE_KEY...${NC}"
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ PRIVATE_KEY is empty!${NC}"
    echo "   Edit backend/.env and add your Ganache private key"
    exit 1
fi

if [ "$PRIVATE_KEY" = "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    echo -e "${RED}❌ PRIVATE_KEY is set to dummy value (all zeros)!${NC}"
    echo ""
    echo "   Get your real private key from Ganache:"
    echo "   1. Open Ganache GUI"
    echo "   2. Look at Account 0"
    echo "   3. Click the key icon"
    echo "   4. Copy the Private Key"
    echo ""
    read -p "   Paste your Ganache private key (0x...): " NEW_KEY
    
    if [ ${#NEW_KEY} -ne 66 ]; then
        echo -e "${RED}❌ Invalid private key format! Should be 66 characters (0x + 64 hex)${NC}"
        exit 1
    fi
    
    # Update the file
    sed -i '' "s|PRIVATE_KEY=.*|PRIVATE_KEY=$NEW_KEY|" backend/.env
    echo -e "${GREEN}✅ Updated PRIVATE_KEY in backend/.env${NC}"
    PRIVATE_KEY="$NEW_KEY"
fi

if [ ${#PRIVATE_KEY} -ne 66 ]; then
    echo -e "${RED}❌ PRIVATE_KEY has wrong length: ${#PRIVATE_KEY} (should be 66)${NC}"
    exit 1
fi

if [[ ! "$PRIVATE_KEY" =~ ^0x[0-9a-fA-F]{64}$ ]]; then
    echo -e "${RED}❌ PRIVATE_KEY has invalid format!${NC}"
    echo "   Should be: 0x + 64 hexadecimal characters"
    exit 1
fi

echo -e "${GREEN}✅ PRIVATE_KEY format is valid${NC}"
echo ""

# 4. Validate CONTRACT_ADDRESS
echo -e "${BLUE}Validating CONTRACT_ADDRESS...${NC}"
if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}❌ CONTRACT_ADDRESS is empty!${NC}"
    exit 1
fi

if [ "$CONTRACT_ADDRESS" = "0x0000000000000000000000000000000000000000" ]; then
    echo -e "${YELLOW}⚠️  CONTRACT_ADDRESS is set to zero address${NC}"
    echo "   This is OK if you haven't deployed yet"
    echo "   Run: bash run.sh to deploy the contract"
fi

if [ ${#CONTRACT_ADDRESS} -ne 42 ]; then
    echo -e "${RED}❌ CONTRACT_ADDRESS has wrong length: ${#CONTRACT_ADDRESS} (should be 42)${NC}"
    exit 1
fi

if [[ ! "$CONTRACT_ADDRESS" =~ ^0x[0-9a-fA-F]{40}$ ]]; then
    echo -e "${RED}❌ CONTRACT_ADDRESS has invalid format!${NC}"
    echo "   Should be: 0x + 40 hexadecimal characters"
    exit 1
fi

echo -e "${GREEN}✅ CONTRACT_ADDRESS format is valid${NC}"
echo ""

# 5. Check Ganache
echo -e "${BLUE}Checking Ganache connection...${NC}"
if nc -z localhost 7545 2>/dev/null; then
    echo -e "${GREEN}✅ Ganache is running on port 7545${NC}"
else
    echo -e "${RED}❌ Ganache is NOT running on port 7545${NC}"
    echo "   Start Ganache GUI or CLI:"
    echo "   ganache-cli --port 7545"
    exit 1
fi
echo ""

# 6. Test backend environment
echo -e "${BLUE}Testing backend environment...${NC}"
cd backend
BACKEND_TEST=$(node -e "require('dotenv').config({path:'./.env'}); const pk = process.env.PRIVATE_KEY; console.log(pk === '0x0000000000000000000000000000000000000000000000000000000000000000' ? 'DUMMY' : 'VALID');" 2>&1)

if [ "$BACKEND_TEST" = "VALID" ]; then
    echo -e "${GREEN}✅ Backend environment loads correctly${NC}"
else
    echo -e "${RED}❌ Backend environment has issues${NC}"
    exit 1
fi
cd "$PROJECT_DIR"
echo ""

# Success
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 All Configuration Valid!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "You can now start the system:"
echo -e "  ${GREEN}bash start-services.sh${NC}"
echo ""
