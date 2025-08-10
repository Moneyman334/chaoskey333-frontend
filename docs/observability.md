# Observability and Security Features

This document describes the enhanced security, observability, and production safety features implemented for the `/health` and `/debug/env` endpoints.

## Overview

The implementation provides Ascension-grade monitoring with:
- Role-based Access Control (RBAC)
- Sliding window rate limiting with anomaly detection
- Tamper-proof audit logging with hash chains
- Automatic sensitive data redaction
- IP allowlisting capabilities
- Webhook notifications for security anomalies

## Endpoints

### `/health`

Enhanced health check endpoint with role-based access levels:

**Public Access** (no authentication):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

**Ops/Admin Access** (with `x-api-role: ops` or `x-api-role: admin`):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "details": {
    "nodeVersion": "v20.19.4",
    "platform": "linux",
    "arch": "x64",
    "memory": {
      "used": 45,
      "total": 128,
      "external": 12
    },
    "responseTime": 2.5,
    "pid": 1234
  }
}
```

**Admin-only additions**:
- `loadAverage`: System load averages
- `freeMemory`: Available system memory
- `totalMemory`: Total system memory

### `/debug/env`

Debug endpoint for environment inspection (admin-only):

**Requirements**:
- `x-api-role: admin` or valid JWT with admin role
- IP address in `ADMIN_ALLOWLIST` (if configured)
- `ENABLE_DEBUG=true` environment variable

**Response**:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "server": {
    "nodeVersion": "v20.19.4",
    "platform": "linux",
    "arch": "x64",
    "uptime": 3600,
    "pid": 1234,
    "cwd": "/app"
  },
  "environment": {
    "NODE_ENV": "production",
    "PORT": "5000",
    "API_KEY": "***REDACTED***",
    "DATABASE_URL": "postgres://localhost:5432/app"
  },
  "audit": {
    "hashChain": {
      "valid": true,
      "message": "Verified 10 entries",
      "count": 10
    }
  },
  "request": {
    "ip": "192.168.1.100",
    "role": "admin",
    "headers": {
      "user-agent": "curl/7.68.0",
      "x-forwarded-for": "203.0.113.1",
      "x-real-ip": "203.0.113.1"
    }
  }
}
```

### `/debug/audit`

Audit log retrieval endpoint (admin-only):

**Query Parameters**:
- `count`: Number of entries to retrieve (max 100, default 50)

**Response**:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "count": 10,
  "logs": [
    {
      "timestamp": 1705317000000,
      "type": "health_check",
      "ip": "192.168.1.100",
      "path": "/health",
      "details": {
        "role": "admin",
        "userAgent": "curl/7.68.0"
      },
      "prevHash": "abc123...",
      "hash": "def456..."
    }
  ]
}
```

## Authentication

### Role-based Access Control

Three authentication methods are supported:

1. **Header-based**: `x-api-role: admin|ops|read`
2. **JWT Bearer tokens**: `Authorization: Bearer <jwt-token>`
3. **Public access**: No authentication (limited data)

**Role Hierarchy**:
- `admin`: Full access to all endpoints and detailed information
- `ops`: Access to health monitoring with detailed metrics
- `read`: Basic health status only (same as public)

### JWT Token Format

JWT tokens should contain a `role` claim:
```json
{
  "role": "admin",
  "iat": 1705317000,
  "exp": 1705320600
}
```

## Security Features

### Rate Limiting

- **Window**: 60 requests per 60 seconds per IP
- **Algorithm**: Sliding window with burst protection
- **Headers**: Standard rate limit headers included
- **Anomaly Detection**: 3+ blocked requests in 10 seconds triggers alert

### IP Allowlisting

Configure with `ADMIN_ALLOWLIST` environment variable:
```bash
ADMIN_ALLOWLIST=192.168.1.100,203.0.113.1,10.0.0.50
```

- If empty or not set, IP allowlisting is disabled
- Only applies to `/debug/env` endpoint
- RBAC is still enforced even with IP allowlisting

### Sensitive Data Redaction

Automatically redacts environment variables matching:
```regex
/key|secret|token|password|private|auth|credential/i
```

Examples of redacted keys:
- `API_KEY`, `SECRET_TOKEN`, `DATABASE_PASSWORD`
- `PRIVATE_KEY`, `AUTH_SECRET`, `STRIPE_SECRET_KEY`

## Audit Logging

### Hash Chain Integrity

Each audit entry includes:
- `timestamp`: Unix timestamp
- `type`: Event type (health_check, debug_access, etc.)
- `ip`: Client IP address
- `path`: Requested path
- `details`: Additional event data
- `prevHash`: Hash of previous entry
- `hash`: SHA256 hash of current entry

### Storage

- **Production**: Vercel KV (when available)
- **Development**: Local filesystem (`.audit-log.json`)
- **Retention**: Last 1000 entries in filesystem, unlimited in KV

### Verification

Hash chain integrity can be verified via the `/debug/env` endpoint or programmatically:
```javascript
const { verifyHashChain } = require('./lib/audit');
const result = await verifyHashChain(10); // Verify last 10 entries
```

## Anomaly Detection

### Trigger Conditions

1. **Rate Limit Violations**: 3+ blocked requests in 10 seconds
2. **Role Mismatches**: 3+ unauthorized access attempts in 10 seconds
3. **IP Violations**: 3+ non-allowlisted IP attempts in 10 seconds

### Webhook Notifications

Configure webhook URL for alerts:
```bash
ANOMALY_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Alert Format** (Slack-compatible):
```json
{
  "text": "🚨 Security Anomaly Detected",
  "attachments": [{
    "color": "danger",
    "fields": [
      { "title": "Type", "value": "RATE LIMIT", "short": true },
      { "title": "IP Address", "value": "192.168.1.100", "short": true },
      { "title": "Count", "value": "5 events in 10 seconds", "short": true },
      { "title": "Path", "value": "/health", "short": true },
      { "title": "Time", "value": "2024-01-15T10:30:00.000Z", "short": false }
    ]
  }]
}
```

## Environment Variables

### Required
- `JWT_SECRET`: Secret for JWT token verification (use strong random value in production)

### Optional
- `ADMIN_ALLOWLIST`: Comma-separated IP addresses for `/debug/env` access
- `ENABLE_DEBUG`: Set to `"true"` to enable `/debug/env` endpoint
- `ANOMALY_WEBHOOK_URL`: Webhook URL for security alerts

### Development Defaults
- `JWT_SECRET`: `"dev-secret-change-in-production"` (change in production!)
- `ADMIN_ALLOWLIST`: Empty (no IP restrictions)
- `ENABLE_DEBUG`: Not set (endpoint disabled)

## Testing

Run the test suite:
```bash
# Security middleware tests
node test/security.test.js

# Audit logging tests
node test/audit.test.js
```

### Manual Testing

1. **Basic health check**:
   ```bash
   curl http://localhost:5000/health
   ```

2. **Ops-level health check**:
   ```bash
   curl -H "x-api-role: ops" http://localhost:5000/health
   ```

3. **Admin health check**:
   ```bash
   curl -H "x-api-role: admin" http://localhost:5000/health
   ```

4. **Debug endpoint** (requires `ENABLE_DEBUG=true`):
   ```bash
   curl -H "x-api-role: admin" http://localhost:5000/debug/env
   ```

5. **JWT authentication**:
   ```bash
   # Generate token (use proper JWT library in production)
   TOKEN=$(node -e "console.log(require('jsonwebtoken').sign({role:'admin'}, process.env.JWT_SECRET || 'dev-secret-change-in-production'))")
   curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/debug/env
   ```

## Deployment

### Vercel Deployment

1. Set environment variables in Vercel dashboard:
   ```bash
   JWT_SECRET=your-super-secret-jwt-key-here
   ADMIN_ALLOWLIST=your.ip.address.here
   ENABLE_DEBUG=true
   ANOMALY_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

2. Deploy the application

3. Test endpoints with proper authentication

### Security Checklist

- [ ] Change `JWT_SECRET` from default value
- [ ] Configure `ADMIN_ALLOWLIST` with your IP addresses
- [ ] Set up webhook URL for anomaly alerts
- [ ] Test all authentication scenarios
- [ ] Verify audit logging is working
- [ ] Monitor rate limiting behavior

## Troubleshooting

### Common Issues

1. **403 Forbidden on `/debug/env`**:
   - Check if `ENABLE_DEBUG=true` is set
   - Verify `x-api-role: admin` header or valid JWT
   - Ensure IP is in `ADMIN_ALLOWLIST` (if configured)

2. **Rate limiting too aggressive**:
   - Adjust rate limits in `lib/monitoring.js`
   - Check for multiple requests from same IP

3. **Audit logs not persisting**:
   - Verify Vercel KV configuration
   - Check filesystem permissions for development fallback

4. **Webhook alerts not working**:
   - Verify `ANOMALY_WEBHOOK_URL` is correct
   - Check webhook service logs
   - Test webhook URL manually

### Debug Commands

```bash
# Check current audit log
cat .audit-log.json | jq .

# Verify hash chain integrity
node -e "require('./lib/audit').verifyHashChain().then(console.log)"

# Test security functions
node test/security.test.js
node test/audit.test.js
```