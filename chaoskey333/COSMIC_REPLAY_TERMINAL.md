# Cosmic Replay Terminal v2.0 - Ascension Edition

## Overview

This implementation provides an immutable vault system for packaging NFT telemetry data into "replay-ready vaults" with automatic rollups and comprehensive admin management.

## Features Implemented

### ✅ Vault Package Structure
- **Deterministic JSON Manifests**: Structured replay vaults with metadata, metrics, leaderboard, events, pricing, and asset references
- **Immutable Design**: Each vault has a unique ID and cryptographic signature for integrity
- **Self-contained**: All necessary data packaged in a single manifest structure

### ✅ Storage Architecture
- **Vercel KV Integration**: Primary storage with deterministic keys `replay:manifest:${YYYYMMDD}:${HHmm}:${id}`
- **Indexing System**: Maintains latest replay, daily lists, and featured replay indices
- **Archive Support**: S3/Backblaze integration for long-term asset retention

### ✅ API Endpoints
- `POST /api/replay/rollup` - Creates new replay vaults with admin authentication
- `GET /api/replay/latest` - Fetches the most recent replay manifest
- `GET /api/replay/:id` - Retrieves specific replay by ID
- `POST /api/replay/pin` - Archives replay assets and manages featured status

### ✅ Admin Dashboard UI
- **Secure Access**: Token-based authentication for admin operations
- **"Replay Now" Button**: Manual rollup triggering with real-time feedback
- **Vault Browser**: Displays latest replay with detailed metrics and leaderboard
- **Archive Management**: Pin and archive replay vaults with one-click actions

### ✅ Automation & Scheduling
- **Vercel Cron**: Automated rollups every 3 hours (`0 */3 * * *`)
- **Activity Triggers**: High-activity rollups (25 mints in 10 minutes)
- **Background Processing**: Cron endpoint for scheduled operations

### ✅ Environment Configuration
- Comprehensive environment variables for KV storage, admin tokens, contract settings
- Support for S3/Backblaze archive configuration
- Chain ID and app version management

## File Structure

```
src/
├── app/
│   ├── admin/                    # Admin dashboard page
│   ├── api/
│   │   ├── replay/
│   │   │   ├── rollup/           # POST rollup creation
│   │   │   ├── latest/           # GET latest replay
│   │   │   ├── [id]/             # GET replay by ID
│   │   │   └── pin/              # POST pin/archive
│   │   └── cron/
│   │       └── replay-rollup/    # Automated cron endpoint
│   └── page.tsx                  # Homepage with terminal access
├── components/
│   └── ReplayDashboard.tsx       # Main admin dashboard component
└── lib/
    ├── types/
    │   └── replay.ts             # TypeScript interfaces
    └── utils/
        ├── storage.ts            # Vercel KV storage layer
        └── aggregator.ts         # Data aggregation and rollup logic
```

## Environment Variables

```env
# Required
ADMIN_TOKEN=your_admin_token_here
CRON_SECRET=your_cron_secret_here

# Vercel KV Storage
KV_URL=your_kv_url_here
KV_REST_API_URL=your_kv_rest_api_url_here
KV_REST_API_TOKEN=your_kv_rest_api_token_here
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token_here

# Application Settings
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D2a3c465c0C0b7f9

# Optional Archive Storage
ARCHIVE_BUCKET=chaoskey333-archives
ARCHIVE_ENDPOINT=
ARCHIVE_ACCESS_KEY=
ARCHIVE_SECRET_KEY=
```

## Usage

### Admin Dashboard
1. Navigate to `/admin`
2. Enter admin token to access the terminal
3. Use "Replay Now" to create manual rollups
4. Pin or archive replay vaults for long-term retention

### API Usage
```bash
# Create a rollup
curl -X POST /api/replay/rollup \
  -H "Content-Type: application/json" \
  -d '{"adminToken": "your-token", "forced": true}'

# Get latest replay
curl /api/replay/latest

# Get specific replay
curl /api/replay/{replayId}

# Pin/archive replay
curl -X POST /api/replay/pin \
  -H "Content-Type: application/json" \
  -d '{"adminToken": "your-token", "replayId": "replay-id", "archiveAssets": true}'
```

## Architecture Notes

### Data Collection
- Currently uses mock data for demonstration
- Replace `ReplayAggregator.collectTelemetryData()` with actual blockchain/contract integration
- Supports custom time ranges for historical rollups

### Security
- Admin token validation on all management endpoints
- Cron secret validation for automated rollups
- Cryptographic signatures for manifest integrity

### Scalability
- Vercel KV for fast access with deterministic keys
- Optional S3/Backblaze archiving for large assets
- Efficient indexing system for quick lookups

## Next Steps

1. **Blockchain Integration**: Replace mock data with actual contract event collection
2. **Asset Upload**: Implement thumbnail and video generation from NFT metadata
3. **Analytics**: Add more detailed metrics and trending analysis
4. **Notifications**: Alert system for high-activity periods
5. **Export Features**: Download replay data in various formats

## Technical Implementation

The system uses a modular architecture with:
- **Storage Layer**: Abstracted KV operations with consistent key patterns
- **Aggregation Layer**: Data collection and processing logic
- **API Layer**: RESTful endpoints with proper error handling
- **UI Layer**: React components with real-time feedback

All code follows TypeScript best practices with proper type safety and error handling throughout the application.