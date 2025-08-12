# Replay Rollup to Relic Evolution Integration

This implementation provides a complete system for linking PR #87 (Cosmic Replay rollups) with the PR #23 → PR #24 Relic Evolution chain, automatically feeding replay rollups into the Permanent Relic Evolution Trigger system.

## Features Implemented

### 1. API Endpoints

#### `/api/replay/ingest` (POST)
- Handles incoming replay rollups from cosmic replay systems
- Validates HMAC signatures for security
- Implements rate limiting and cooldown periods
- Stores rollup data in Vercel KV with automatic expiration
- Queues evolution jobs when minimum signal threshold is met
- Generates deterministic mutation seeds from rollup data

#### `/api/cron/evolution-digest` (POST/GET)
- Processes evolution job queue in batch mode
- Applies mutations to relics based on deterministic seeds
- Supports dry-run mode for testing
- Maintains audit trail of all mutations
- Enforces cooldown periods to prevent spam

#### `/api/admin/evolution-audit` (GET)
- Retrieves audit trail entries for monitoring
- Supports filtering by specific relic ID
- Paginated results for performance

### 2. Storage Architecture

Uses Vercel KV for distributed storage with the following key patterns:

- `replay:rollups:{broadcastId}` - Stores replay rollup data (7-day TTL)
- `evolution:queue` - Queue of pending evolution jobs
- `evolution:last:{relicId}` - Last evolution timestamp for cooldown
- `evolution:audit:{relicId}` - Audit trail for each relic
- `evolution:ratelimit:{relicId}:{hour}` - Rate limiting counters
- `relic:traits:{relicId}` - Current relic traits (applied mutations)

### 3. Security & Safety Measures

- **HMAC Signature Validation**: Optional HMAC signatures using `REPLAY_SIGNING_SECRET`
- **Rate Limiting**: Configurable hourly limits per relic (`EVOLUTION_MAX_PER_HOUR`)
- **Cooldown Periods**: Prevents rapid-fire mutations (`EVOLUTION_COOLDOWN_SEC`)
- **Feature Flag**: System can be completely disabled (`EVOLUTION_AUTO_FEED=false`)
- **Dry Run Mode**: Test mutations without applying them (`EVOLUTION_DRY_RUN=true`)

### 4. Mutation Logic

- **Deterministic Seeds**: Generated from rollup data using stable hashing
- **Trait Categories**: Energy, Resonance, Purity, Attunement, Power
- **Rarity Scaling**: Higher rollup counts unlock rarer traits
- **Seed-Based Generation**: Same rollup data always produces same traits

### 5. UI Components

#### Evolution Badge
- Shows "Auto-evolution active" when system is enabled
- Animated indicator for visual feedback
- Responsive design for multiple screen sizes

#### Replay Terminal (`/replay`)
- Interactive form for submitting rollup data
- Sample data generation for testing
- Real-time response display
- Educational information about the process

#### Admin Dashboard (`/admin`)
- System status overview
- Evolution audit trail table
- Configuration display
- Real-time monitoring capabilities

### 6. Cron Job Configuration

Vercel Cron job runs every minute to process the evolution queue:

```json
{
  "crons": [
    {
      "path": "/api/cron/evolution-digest",
      "schedule": "* * * * *"
    }
  ]
}
```

## Environment Variables

### Required
- `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` - Vercel KV configuration

### Optional
- `EVOLUTION_AUTO_FEED=true` - Enable/disable the system
- `EVOLUTION_DRY_RUN=false` - Run in test mode without applying mutations
- `EVOLUTION_MIN_SIGNALS=3` - Minimum rollups required to trigger evolution
- `EVOLUTION_COOLDOWN_SEC=300` - Seconds between mutations for same relic
- `EVOLUTION_MAX_PER_HOUR=10` - Maximum mutations per relic per hour
- `REPLAY_SIGNING_SECRET` - HMAC secret for payload validation
- `CRON_SECRET` - Optional authentication for cron endpoint

### Public (Browser-accessible)
- `NEXT_PUBLIC_EVOLUTION_AUTO_FEED` - Shows badge status in UI
- `NEXT_PUBLIC_EVOLUTION_DRY_RUN` - Shows dry-run status in UI
- `NEXT_PUBLIC_EVOLUTION_MIN_SIGNALS` - Shows config in UI

## Data Flow

1. **Rollup Submission**: Cosmic replay system sends rollup data to `/api/replay/ingest`
2. **Validation**: System validates signature, checks rate limits and cooldowns
3. **Storage**: Rollup data stored in KV with automatic expiration
4. **Threshold Check**: System counts rollups for the target relic
5. **Queue Creation**: If threshold met, evolution job queued with mutation seed
6. **Cron Processing**: Every minute, cron job processes pending evolution jobs
7. **Mutation Application**: Traits generated and applied to relic (or logged if dry-run)
8. **Audit Logging**: All actions logged for monitoring and potential rollback

## Testing

Use the test script at `/tmp/test_evolution_system.sh` to verify functionality:

1. Submits multiple rollups for the same relic
2. Triggers evolution when threshold is reached
3. Processes evolution queue
4. Verifies audit trail creation

## Monitoring

- Check `/admin` dashboard for real-time system status
- Review audit trail for all evolution events
- Monitor rate limiting and cooldown enforcement
- Verify cron job execution in Vercel dashboard

This implementation ensures secure, efficient, and scalable integration of replay rollups into relic evolution while maintaining complete audit trails and safety controls.