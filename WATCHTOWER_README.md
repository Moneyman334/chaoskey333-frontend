# Watchtower Signal Amplifier Integration Guide

## Overview

The Watchtower Signal Amplifier provides real-time monitoring and alerts for the ChaosKey333 Ascension chain. This system enables glyph alerts, vault broadcast pulses, and notifications during key relic events.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Express.js    │───▶│   Next.js API    │───▶│  Client Browser │
│   Server        │    │   Watchtower     │    │   SSE Stream    │
│ (Stripe/Mint)   │    │   (SSE/Events)   │    │   (Toast/UI)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Environment Variables

Add these to your `.env.local` (Next.js) and `.env` (Express.js):

```bash
# Watchtower Configuration
NEXT_PUBLIC_WATCHTOWER_ENABLED=true
WATCHTOWER_ENABLED=true
WATCHTOWER_SIGNING_SECRET=your-secure-random-secret-key

# For server-to-server communication
NEXTJS_BASE_URL=http://localhost:3000

# Vercel KV (Production)
KV_REST_API_URL=your-vercel-kv-url
KV_REST_API_TOKEN=your-vercel-kv-token
```

## Quick Start

### 1. Install Dependencies

```bash
cd chaoskey333/
npm install @vercel/kv eventsource
```

### 2. Start the System

**Terminal 1 - Next.js Watchtower System:**
```bash
cd chaoskey333/
npm run dev
```

**Terminal 2 - Express.js Server (Optional):**
```bash
# Use the enhanced server with Watchtower integration
node server-with-watchtower.js
```

### 3. Test the System

**Test API endpoints:**
```bash
# Test system health
curl http://localhost:3000/api/test

# Emit test events
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"testType": "payment"}'

# Test SSE stream
curl -N http://localhost:3000/api/watchtower/stream
```

**Test Express.js integration:**
```bash
# Test Watchtower from Express server
curl -X POST http://localhost:5000/api/test-watchtower \
  -H "Content-Type: application/json" \
  -d '{"eventType": "payment"}'
```

## Integration Examples

### Stripe Webhook Integration

Replace your existing webhook handler with:

```javascript
const { WatchtowerEmitters } = require('./lib/watchtower-express.js');

app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // ... existing webhook verification code ...

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Emit payment success event
    await WatchtowerEmitters.paymentSuccess(
      session.id,
      session.amount_total,
      session.metadata.walletAddress
    );
    
    // ... existing minting logic ...
  }
});
```

### Relic Minting Integration

```javascript
// After successful NFT mint
async function onRelicMinted(tokenId, walletAddress, relicType) {
  await WatchtowerEmitters.relicMinted(tokenId, walletAddress, relicType);
}
```

### Leaderboard Updates

```javascript
// From Next.js API routes
import { ServerEventEmitters } from '@/lib/watchtower-emitter';

export async function POST(request) {
  // ... leaderboard update logic ...
  
  await ServerEventEmitters.leaderboardUpdate(
    walletAddress,
    newRank,
    oldRank
  );
}
```

## Event Types

| Event Type | Priority | Use Case |
|------------|----------|----------|
| `payment.success` | High | Stripe payment completion |
| `relic.minted` | Critical | NFT minting success |
| `leaderboard.update` | High/Medium | Rank changes |
| `glyph.alert` | Variable | System alerts |
| `vault.pulse` | Low | General activity |
| `system.heartbeat` | Low | Health monitoring |

## Client Features

### Connection Status
- **Green dot**: Connected and receiving events
- **Yellow dot**: Connecting/reconnecting
- **Red dot**: Connection error
- **Gray dot**: Disconnected

### Notifications
- **Toast notifications**: All events with auto-hide
- **Banner alerts**: High/critical priority events
- **Priority styling**: Color-coded by importance

### Auto-reconnection
- Exponential backoff strategy
- Up to 5 reconnection attempts
- Graceful degradation on failure

## Production Deployment

### Vercel Deployment

1. **Set environment variables in Vercel:**
```bash
vercel env add WATCHTOWER_SIGNING_SECRET
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
```

2. **Deploy:**
```bash
cd chaoskey333/
vercel --prod --confirm --name=chaoskey333-casino
```

3. **Update Express.js environment:**
```bash
# Point to production Next.js app
NEXTJS_BASE_URL=https://your-app.vercel.app
```

### Security Notes

- **Rotate `WATCHTOWER_SIGNING_SECRET` regularly**
- **Use HTTPS in production**
- **Monitor rate limits and adjust as needed**
- **Keep event payloads minimal for privacy**

## Rate Limits

| Type | Default Limit | Time Window |
|------|---------------|-------------|
| Per IP | 100 requests | 1 minute |
| Per Wallet | 50 requests | 1 minute |
| Per Event Type | 200 requests | 1 minute |

## Troubleshooting

### Common Issues

**"Disconnected" status in browser:**
- Check if Next.js dev server is running on port 3000
- Verify `NEXT_PUBLIC_WATCHTOWER_ENABLED=true`
- Check browser console for connection errors

**Events not broadcasting:**
- Verify `WATCHTOWER_SIGNING_SECRET` matches in both apps
- Check API endpoint logs for signature verification errors
- Ensure rate limits aren't exceeded

**Express.js integration failing:**
- Verify `NEXTJS_BASE_URL` points to correct Next.js app
- Check network connectivity between services
- Ensure `node-fetch` is installed for Express.js server

### Debug Mode

Enable debug logging:
```bash
NODE_ENV=development
```

### Health Checks

```bash
# Check Watchtower system status
curl http://localhost:3000/api/watchtower/emit

# Test full system integration
curl http://localhost:5000/api/test-all
```

## Optional Enhancements

### Twitter/X Integration
- Add Twitter API credentials to emit tweets for `relic.minted` events
- Configure in `lib/watchtower-emitter.ts`

### Email/SMS Notifications
- Integrate with SendGrid/Twilio for critical alerts
- Add webhook endpoints for external notification services

### Web Push Notifications
- Implement service worker for browser push notifications
- Extend WatchtowerClient with push subscription management

## API Reference

### SSE Stream Endpoint
```
GET /api/watchtower/stream
Headers: Last-Event-ID (for reconnection)
Response: text/event-stream
```

### Event Emission Endpoint
```
POST /api/watchtower/emit
Body: { event: SignedWatchtowerEvent, source: string }
Response: { success: boolean, eventId: string }
```

### Test Endpoint
```
POST /api/test
Body: { testType: "system" | "payment" | "relic" | "leaderboard" | "glyph" }
Response: { success: boolean, testType: string, timestamp: number }
```