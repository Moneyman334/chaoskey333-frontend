# Security-Enhanced Endpoints Documentation

## Overview
The ChaosKey333 Frontend now includes production-grade secure endpoints for health monitoring and debugging, designed with security-first principles and comprehensive observability features.

## Endpoints

### `/health` - Health Check Endpoint

**Security:** Public access, rate-limited (30 requests/minute)
**Purpose:** Comprehensive application health monitoring

**Response Format:**
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2025-08-10T20:28:55.836Z", 
  "uptime": 1337,
  "version": "1.0.0",
  "lastDeploy": "2025-08-10T20:25:51.825Z",
  "dependencies": {
    "stripe": {
      "status": "healthy|unhealthy|disabled",
      "responseTime": 45,
      "service": "stripe"
    }
  }
}
```

**Status Codes:**
- `200`: Healthy or degraded (some dependencies down)
- `503`: Unhealthy (critical failures)

### `/debug/env` - Debug Environment Endpoint

**Security:** Restricted access, IP whitelisted, rate-limited (5 requests/5 minutes)
**Purpose:** Secure environment variable inspection for debugging

**Access Requirements:**
1. `ENABLE_DEBUG=true` environment variable must be set
2. Client IP must be in whitelist (default: localhost only)
3. Rate limiting: 5 requests per 5 minutes

**Response Format:**
```json
{
  "timestamp": "2025-08-10T20:29:03.723Z",
  "clientIp": "127.0.0.1", 
  "environment": {
    "NODE_ENV": "development",
    "PORT": "5000",
    "STRIPE_SECRET_KEY": "sk_t****************************5678",
    "PRIVATE_KEY": "abc1**************************34yz"
  },
  "nodeVersion": "v20.19.4",
  "platform": "linux",
  "architecture": "x64",
  "memoryUsage": {...},
  "uptime": 28.304
}
```

**Access Control:**
- **Disabled by default** (returns 404)
- **IP Whitelisting:** Configure via `DEBUG_IP_WHITELIST` environment variable
- **Sensitive Data Masking:** All keys containing SECRET, KEY, TOKEN, PASSWORD, etc. are automatically masked

## Configuration

### Environment Variables

```bash
# Required for debug endpoint
ENABLE_DEBUG=true

# Optional: Configure IP whitelist for debug endpoint (comma-separated)
DEBUG_IP_WHITELIST=127.0.0.1,192.168.1.0/24,10.0.0.100

# Application secrets (automatically masked in debug output)
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
PRIVATE_KEY=your_actual_wallet_private_key_here_without_0x
```

### Security Features

#### Rate Limiting
- **Health endpoint:** 30 requests per minute per IP
- **Debug endpoint:** 5 requests per 5 minutes per IP
- Automatic HTTP 429 responses with retry information

#### IP Whitelisting
- Supports individual IPs: `127.0.0.1`
- Supports CIDR ranges: `192.168.1.0/24`
- Supports multiple entries: `127.0.0.1,192.168.1.0/24,10.0.0.1`
- Defaults to localhost-only access

#### Sensitive Data Protection
- Automatic detection of sensitive environment variables
- Smart masking preserves identification while hiding secrets
- Configurable patterns for different types of sensitive data

## Usage Examples

### Health Check
```bash
# Basic health check
curl http://localhost:5000/health

# Check specific dependency status
curl http://localhost:5000/health | jq '.dependencies.stripe.status'
```

### Debug Access (Development)
```bash
# Enable debug endpoint
export ENABLE_DEBUG=true

# Allow specific IP ranges
export DEBUG_IP_WHITELIST="127.0.0.1,192.168.1.0/24"

# Access debug info
curl http://localhost:5000/debug/env | jq '.'
```

### Production Deployment
```bash
# Disable debug endpoint (default)
unset ENABLE_DEBUG

# Or explicitly disable
export ENABLE_DEBUG=false

# Health checks remain available
curl https://your-domain.com/health
```

## Error Responses

### Rate Limit Exceeded
```json
{
  "error": "Too many health check requests from this IP, please try again later.",
  "retryAfter": "60 seconds"
}
```

### Debug Endpoint Disabled
```json
{
  "error": "Debug endpoint is disabled", 
  "message": "Set ENABLE_DEBUG=true to enable debug endpoints"
}
```

### Access Denied (IP Not Whitelisted)
```json
{
  "error": "Access denied",
  "message": "Your IP address is not authorized to access this endpoint"
}
```

## Monitoring Integration

The endpoints are designed for integration with monitoring services:

- **Health checks** can be used by load balancers, Kubernetes probes, and monitoring services
- **Error logging** includes structured context for external monitoring tools
- **Metrics** include response times and dependency status for observability dashboards

## Security Best Practices

1. **Never enable debug endpoint in production** unless absolutely necessary
2. **Use strict IP whitelisting** for debug access
3. **Monitor rate limit violations** as potential security issues
4. **Regularly rotate sensitive keys** mentioned in environment variables
5. **Use HTTPS in production** to protect data in transit