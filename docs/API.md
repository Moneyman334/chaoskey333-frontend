# API Endpoints

This document describes the available API endpoints for the ChaosKey333 Frontend server.

## Health Check Endpoint

### GET /health

Returns a simple health check message to verify the server is running.

**Response:**
- **Status Code:** 200 OK
- **Content-Type:** text/html; charset=utf-8
- **Body:** `✅ Server is alive and kickin'`

**Example:**
```bash
curl http://localhost:5000/health
```

## Debug Environment Endpoint

### GET /debug/env

Returns environment configuration and runtime information for debugging and monitoring purposes.

**Response:**
- **Status Code:** 200 OK
- **Content-Type:** application/json; charset=utf-8
- **Body:** JSON object with server, environment, and runtime information

**Response Schema:**
```json
{
  "server": {
    "name": "string",
    "version": "string", 
    "nodeVersion": "string",
    "port": "string",
    "uptime": "number",
    "timestamp": "string (ISO 8601)"
  },
  "environment": {
    "nodeEnv": "string",
    "hasStripePublicKey": "boolean",
    "hasStripeSecretKey": "boolean",
    "hasStripeWebhookSecret": "boolean",
    "hasPrivateKey": "boolean"
  },
  "runtime": {
    "platform": "string",
    "arch": "string",
    "memoryUsage": {
      "rss": "number",
      "heapTotal": "number", 
      "heapUsed": "number",
      "external": "number",
      "arrayBuffers": "number"
    }
  }
}
```

**Security Note:** This endpoint only exposes boolean flags indicating whether environment variables exist, not their actual values. No sensitive data is included in the response.

**Example:**
```bash
curl http://localhost:5000/debug/env | jq .
```

## Environment Setup

The server requires environment variables to start properly. Copy `.env.example` to `.env` and configure the required values:

```bash
cp .env.example .env
# Edit .env with your actual values
```

Required environment variables:
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_PUBLIC_KEY`: Your Stripe public key

Optional environment variables:
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (default: development)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret for payment verification
- `PRIVATE_KEY`: Wallet private key for blockchain operations