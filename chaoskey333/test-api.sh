#!/bin/bash

# Example API calls for Master Command Layer
BASE_URL="http://localhost:3000"
SECRET="demo_secret_key_12345"

echo "🧪 Testing Master Command Layer API"
echo "===================================="

# Function to create HMAC signature
create_signature() {
    local payload="$1"
    echo -n "$payload" | openssl dgst -sha256 -hmac "$SECRET" -binary | xxd -p -c 256
}

# Test 1: Get current state
echo ""
echo "📊 Getting current state..."
curl -s "$BASE_URL/api/state" | jq .

# Test 2: Get recent events
echo ""
echo "📝 Getting recent events..."
curl -s "$BASE_URL/api/events?limit=5" | jq .

# Test 3: Execute a command (HUD.DECODE.ENABLE)
echo ""
echo "⚡ Executing HUD.DECODE.ENABLE command..."

TIMESTAMP=$(date +%s%3N)
COMMAND=$(cat <<EOF
{
  "type": "HUD.DECODE.ENABLE",
  "payload": {"reason": "Manual activation"},
  "idempotencyKey": "test_hud_enable_$TIMESTAMP",
  "timestamp": $TIMESTAMP,
  "actor": "owner"
}
EOF
)

SIGNATURE=$(create_signature "$COMMAND")
SIGNED_COMMAND=$(echo "$COMMAND" | jq --arg sig "$SIGNATURE" '. + {signature: $sig}')

echo "Command: $SIGNED_COMMAND"
echo ""

curl -s -X POST "$BASE_URL/api/command" \
  -H "Content-Type: application/json" \
  -d "$SIGNED_COMMAND" | jq .

# Test 4: Check state again
echo ""
echo "📊 Checking state after command..."
curl -s "$BASE_URL/api/state" | jq .

echo ""
echo "✅ API test complete"