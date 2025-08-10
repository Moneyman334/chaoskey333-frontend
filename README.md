# ChaosKey333 - Cosmic Replay Terminal

[![ChaosKey333 Status](https://img.shields.io/endpoint?url=https://your-deployed-url.vercel.app/api/shields/replay)](https://your-deployed-url.vercel.app)

The ultimate blockchain vault and cosmic replay terminal with enhanced operational resilience.

## 🌌 Features

### Core Functionality
- **Cosmic Replay Terminal**: Interactive blockchain exploration interface
- **Wallet Integration**: Connect your Web3 wallet via ThirdwebSDK
- **Vault Management**: Secure blockchain asset management

### Ops Hardening Pack v2.0.0-replay
- **🔍 Health Monitoring**: Lightweight and deep health check endpoints
- **📊 Status Badge**: Real-time system status via Shields.io
- **⏰ Automated Monitoring**: Vercel cron jobs for regular health checks
- **🎯 Broadcast Banner**: Global UX nudge banner for important announcements
- **📝 Optional Monitoring**: Extensible logging system with Sentry support

## 🚀 Quick Start

### Development
```bash
cd chaoskey333
npm install
npm run dev
```

### Production Deployment
```bash
cd chaoskey333
npm run build
vercel --prod
```

## 🔧 Environment Variables

Create a `.env.local` file in the `chaoskey333` directory:

```env
# Required
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_TEMPLATE_CLIENT_ID=your_thirdweb_client_id

# Optional - KV Storage
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token

# Optional - Error Tracking
SENTRY_DSN=your_sentry_dsn
```

## 📡 Health Endpoints

- `GET /api/replay/health` - Basic health check
- `GET /api/replay/health/deep` - Comprehensive system health
- `GET /api/shields/replay` - Shields.io compatible status badge

## 🎮 Terminal Commands

Navigate to `/replay` to access the Cosmic Replay Terminal:

- `help` - Show available commands
- `status` - Display system status
- `vault` - Check vault security
- `version` - Show version information
- `clear` - Clear terminal history

## 🛠 Technology Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Blockchain**: ThirdwebSDK v5
- **Deployment**: Vercel with cron jobs
- **Monitoring**: Custom logging + optional Sentry

## 📋 Deployment Checklist

- [ ] Set environment variables in Vercel
- [ ] Deploy to production via `vercel --prod`
- [ ] Verify health endpoints respond correctly
- [ ] Check status badge displays "online"
- [ ] Test `/replay` terminal functionality
- [ ] Confirm broadcast banner visibility

## 🔄 Rollback Plan

Use Vercel's promote command to roll back to previous deployment:
```bash
vercel --prod --promote [previous-deployment-url]
```

## 📞 Support

For issues or questions, check the health endpoints first:
- Basic health: `/api/replay/health`
- Detailed diagnostics: `/api/replay/health/deep`

---

⚡ **Ops Hardening Pack Active** | 🌌 **Cosmic Replay Terminal Ready**