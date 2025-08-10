# Multi-Channel Signal Pulse Add-On for ChaosKey333 Watchtower

This implementation expands PR #49 with a complete Multi-Channel Signal Pulse Add-On that enables real-time event broadcasting across multiple communication channels for the ChaosKey333 ecosystem.

## 🚨 Features

### Real-Time Event Broadcasting
- **Server-Sent Events (SSE)** streaming for instant client notifications
- **HMAC-signed events** for security and authenticity
- **Rate limiting** and backpressure handling
- **Automatic reconnection** with exponential backoff

### Multi-Channel Pulse System
1. **Twitter/X Auto-Pulses** - Post glyph snapshots within 3 seconds with chaos glyph IDs
2. **Email Nudges** - Send decoded event summaries with vault links and encrypted attachments  
3. **SMS Alerts** - Send urgent notifications with embedded vault links
4. **Pulse Sync Priority** - Ensure all channels fire within 5-second window

### Real-Time UI Components
- **Connection Status Indicator** (ONLINE/OFFLINE)
- **Priority Banner Alerts** for glyph detections and chaos alerts
- **Toast Notifications** for all events with auto-dismiss
- **Neon Styling** matching vault theme

## 🏗️ Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   Express Server    │────▶│    Next.js App       │────▶│  Multi-Channel      │
│   (Stripe Webhook)  │     │  (Watchtower APIs)   │     │  Pulse System       │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
                                        │                           │
                                        ▼                           ▼
                             ┌──────────────────────┐     ┌─────────────────────┐
                             │   SSE Stream API     │     │  Twitter/Email/SMS  │
                             │ (Real-time Client)   │     │    Broadcasting     │
                             └──────────────────────┘     └─────────────────────┘
```

## 📁 File Structure

```
chaoskey333/
├── src/
│   ├── app/
│   │   ├── api/watchtower/
│   │   │   ├── stream/route.ts     # SSE endpoint
│   │   │   └── emit/route.ts       # Event emission API
│   │   ├── components/
│   │   │   └── WatchtowerClient.tsx # Real-time UI component
│   │   └── layout.tsx              # App layout with Watchtower
│   └── lib/
│       ├── watchtower.ts           # Core event bus & utilities
│       ├── watchtower-store.ts     # KV storage & rate limiting
│       └── multi-channel-pulse.ts  # Multi-channel broadcasting
└── .env.example                    # Configuration template
```

## ⚙️ Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Watchtower Security
WATCHTOWER_HMAC_SECRET=your-hmac-secret-key
WATCHTOWER_AUTH_SECRET=your-auth-secret

# Twitter/X Integration
TWITTER_ENABLED=true
TWITTER_CONSUMER_KEY=your-key
TWITTER_CONSUMER_SECRET=your-secret
TWITTER_ACCESS_TOKEN=your-token
TWITTER_ACCESS_SECRET=your-token-secret

# Email Integration
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Integration
SMS_ENABLED=true
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
TWILIO_FROM_NUMBER=+1234567890
```

### 2. Install Dependencies

```bash
cd chaoskey333/
npm install

# For root Express server
cd ../
npm install
```

### 3. Development

```bash
# Start Next.js app (port 3000)
cd chaoskey333/
npm run dev

# Start Express server (port 5000) - for Stripe webhooks
cd ../
npm run dev
```

## 🔥 API Usage

### Emit Events

```bash
curl -X POST "http://localhost:3000/api/watchtower/emit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-auth-secret" \
  -d '{
    "type": "glyph_detection",
    "data": {
      "glyphId": "CG12345EXAMPLE",
      "eventCode": "EX001",
      "metadata": {"source": "vault_scanner"}
    },
    "channels": ["twitter", "email", "sms"]
  }'
```

### Stream Events (SSE)

```javascript
const eventSource = new EventSource('/api/watchtower/stream');
eventSource.onmessage = (event) => {
  const watchtowerEvent = JSON.parse(event.data);
  console.log('Received:', watchtowerEvent);
};
```

## 📡 Event Types

- **`glyph_detection`** - Chaos glyph discovered (triggers banner + toast)
- **`vault_event`** - Vault activity detected
- **`relic_mint`** - NFT minting event (auto-triggered by Stripe)
- **`chaos_alert`** - High-priority system alert (triggers banner + toast)

## 🔐 Security Features

- **HMAC Event Signing** - All events cryptographically signed
- **Rate Limiting** - Prevent spam and abuse
- **Authenticated APIs** - Bearer token required for event emission
- **CORS Protection** - Configured for secure browser access

## 🚀 Deployment

### Vercel (Recommended)

1. Configure environment variables in Vercel dashboard
2. Add Vercel KV database for production storage
3. Deploy Next.js app to Vercel

### Self-Hosted

1. Build the application: `npm run build`
2. Configure production environment variables
3. Use PM2 or similar for process management
4. Set up reverse proxy (Nginx recommended)

## 📈 Monitoring

Events include metadata for tracking:
- **Glyph ID**: Auto-generated chaos identifiers
- **Event Code**: 8-character tracking codes
- **Timestamps**: Millisecond precision
- **Pulse Results**: Multi-channel delivery status
- **Sync Validation**: 5-second window compliance

## 🔗 Integration Points

### Stripe Webhooks
Automatically triggers `relic_mint` events on payment completion.

### Vault Links
All events include direct links to `chaoskey333.web.app/vault?event={id}`.

### Community Tracking
Auto-generated chaos glyph IDs enable community event coordination.

---

*This implementation ensures the Watchtower amplifies Sentinel's signals across the network in real-time, providing immediate awareness and engagement for the ChaosKey333 community.*