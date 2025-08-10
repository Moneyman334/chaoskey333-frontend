#!/bin/bash

# Demo script for Master Command Layer
echo "🚀 Starting ChaosKey333 Ascension Terminal Demo"
echo "================================================"

# Set environment variables for demo
export MASTER_HMAC_SECRET="demo_secret_key_12345"
export OPERATOR_KEYS="owner:alice,operator:bob,bot:charlie"
export ASCENSION_DRY_RUN="false"
export ASCENSION_PAUSED="false"

echo "Environment configured:"
echo "  ASCENSION_DRY_RUN: $ASCENSION_DRY_RUN"
echo "  ASCENSION_PAUSED: $ASCENSION_PAUSED"
echo "  Operators: $OPERATOR_KEYS"
echo ""

# Start the Next.js development server
echo "Starting development server..."
cd /home/runner/work/chaoskey333-frontend/chaoskey333-frontend/chaoskey333

# Run the server
npm run dev