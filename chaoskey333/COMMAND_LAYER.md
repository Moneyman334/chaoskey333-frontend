# ChaosKey333 Master Command Layer

The Master Command Layer transforms the Ascension Terminal into the central command hub for all relic events. This system provides a robust command bus, state management, and event handling to ensure seamless execution of replay, decode, and evolution commands.

## 🏗️ Architecture

### Core Components

1. **Command Bus** (`/lib/commandBus.ts`)
   - Validates and executes commands with idempotency protection
   - Implements role-based access control and HMAC signatures
   - Supports dry-run mode and circuit breaker functionality

2. **Policy & Auth** (`/lib/policy.ts`)
   - Role-based permissions (owner, operator, bot)
   - HMAC signature validation for security
   - Command-specific permission mapping

3. **State Management** (`/lib/state.ts`)
   - Canonical state stored in Vercel KV
   - Real-time state updates and snapshots
   - Migration-friendly state structure

4. **Event Logging** (`/lib/events.ts`)
   - Append-only event log with timestamps
   - Actor tracking and metadata support
   - Efficient querying by type, time, and sequence

### API Endpoints

- `POST /api/command` - Execute commands with HMAC authentication
- `GET /api/state` - Retrieve current consolidated state
- `GET /api/events` - Stream incremental events with filtering

## 🎮 Supported Commands

| Command | Description | Required Role |
|---------|-------------|---------------|
| `REPLAY.START` | Start cosmic replay | owner, operator |
| `REPLAY.STOP` | Stop cosmic replay | owner, operator |
| `HUD.DECODE.ENABLE` | Enable HUD decoding | owner, operator, bot |
| `HUD.DECODE.DISABLE` | Disable HUD decoding | owner, operator |
| `RELIC.EVOLVE.TRIGGER` | Trigger relic evolution | owner |
| `BROADCAST.PULSE` | Send broadcast pulse | owner, operator, bot |
| `MINT.GATE.OPEN` | Open minting gate | owner, operator |
| `MINT.GATE.CLOSE` | Close minting gate | owner, operator |

## 🔧 Configuration

### Environment Variables

```bash
# Required
MASTER_HMAC_SECRET=your_secret_key_here
OPERATOR_KEYS=key1:owner,key2:operator,key3:bot

# Optional  
ASCENSION_DRY_RUN=true          # Default: true
ASCENSION_PAUSED=false          # Default: false

# Vercel KV (configured in dashboard)
KV_URL=redis://localhost:6379
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
```

### Role Definitions

- **Owner**: Full access to all commands
- **Operator**: Access to most commands except critical evolution triggers
- **Bot**: Limited access to pulse and HUD commands

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   cd chaoskey333
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test the API**
   ```bash
   ./test-api.sh
   ```

## 📝 Usage Examples

### Execute a Command

```javascript
const command = {
  type: "HUD.DECODE.ENABLE",
  payload: { reason: "Manual activation" },
  idempotencyKey: "unique_key_123",
  timestamp: Date.now(),
  actor: "operator_key_456",
  signature: "computed_hmac_signature"
};

const response = await fetch('/api/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(command)
});
```

### Get Current State

```javascript
const response = await fetch('/api/state');
const { state, timestamp } = await response.json();

console.log('Replay active:', state.replay.active);
console.log('HUD decode enabled:', state.hud.decodeEnabled);
```

### Stream Events

```javascript
const response = await fetch('/api/events?since=1640995200000&limit=50');
const { events } = await response.json();

events.forEach(event => {
  console.log(`${event.type} by ${event.actor} at ${new Date(event.timestamp)}`);
});
```

## 🛡️ Security Features

### HMAC Authentication
All commands must be signed with HMAC-SHA256 using the master secret:

```javascript
const crypto = require('crypto');

function signCommand(command) {
  const { signature, ...payload } = command;
  const hmac = crypto.createHmac('sha256', process.env.MASTER_HMAC_SECRET);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}
```

### Idempotency Protection
Commands are protected against replay attacks using idempotency keys:
- Duplicate commands return 409 Conflict
- Results cached for 24 hours in KV store

### Rate Limiting
Per-actor, per-command rate limits:
- `RELIC.EVOLVE.TRIGGER`: 5/hour
- `REPLAY.*`: 10/hour  
- `BROADCAST.PULSE`: 30/hour

## 🧪 Testing

### Run Test Suite
```bash
node test-command-layer.js
```

### Manual API Testing
```bash
./test-api.sh
```

### Test Checklist
- [x] Invalid signature returns 401
- [x] Duplicate idempotency key returns 409
- [x] State reflects command execution within 1s
- [x] Events are logged with correct metadata
- [x] Role-based access control works

## 🔄 Rollout Process

1. **Dry Run Mode** (`ASCENSION_DRY_RUN=true`)
   - Commands logged but no mutations executed
   - UI animations work normally

2. **Circuit Breaker** (`ASCENSION_PAUSED=true`)
   - Halts command execution but continues logging
   - Emergency stop functionality

3. **Production Mode**
   - Set `ASCENSION_DRY_RUN=false`
   - Monitor state changes and event logs

## 📊 Monitoring

### State Monitoring
Monitor key state fields:
- `state.replay.active`
- `state.hud.decodeEnabled`
- `state.relic.evolving`
- `state.mint.gateOpen`

### Event Analytics
Track command execution:
- Command frequency by type
- Actor activity patterns
- Error rates and failures

### Health Checks
- KV connectivity
- State consistency
- Event log integrity

## 🔧 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check HMAC secret configuration
   - Verify signature calculation

2. **403 Forbidden**
   - Check actor role assignment
   - Verify command permissions

3. **409 Conflict**
   - Generate new idempotency key
   - Check for duplicate commands

4. **State Not Updating**
   - Verify KV connectivity
   - Check for circuit breaker activation

### Debug Mode
Enable detailed logging:
```bash
DEBUG=chaoskey:* npm run dev
```

## 🎯 Next Steps

- [ ] Add WebSocket support for real-time updates
- [ ] Implement command scheduling/cron jobs
- [ ] Add metrics and analytics dashboard
- [ ] Create admin interface for role management
- [ ] Add command history and audit trails