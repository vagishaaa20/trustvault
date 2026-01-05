#!/bin/bash

# Deploy contract and update all Python scripts with the new address

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔄 Deploying smart contract..."
cd "$PROJECT_DIR"

# Deploy and capture output
DEPLOY_OUTPUT=$(npx truffle migrate --network ganache 2>&1)

# Extract contract address from deployment output
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "contract address:" | tail -1 | grep -oE '0x[a-fA-F0-9]+')

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo " Failed to extract contract address from deployment"
    exit 1
fi

echo "Contract deployed at: $CONTRACT_ADDRESS"

# Update all Python scripts with the new contract address
echo "📝 Updating Python scripts..."

# Update insert.py
sed -i '' "s/CONTRACT_ADDRESS = \"0x[a-fA-F0-9]*\"/CONTRACT_ADDRESS = \"$CONTRACT_ADDRESS\"/g" "$PROJECT_DIR/insert.py"

# Update verifyBlock.py
sed -i '' "s/CONTRACT_ADDRESS = \"0x[a-fA-F0-9]*\"/CONTRACT_ADDRESS = \"$CONTRACT_ADDRESS\"/g" "$PROJECT_DIR/verifyBlock.py"

# Update queryEvidence.py
sed -i '' "s/CONTRACT_ADDRESS = \"0x[a-fA-F0-9]*\"/CONTRACT_ADDRESS = \"$CONTRACT_ADDRESS\"/g" "$PROJECT_DIR/queryEvidence.py"

echo " All Python scripts updated with new contract address: $CONTRACT_ADDRESS"
