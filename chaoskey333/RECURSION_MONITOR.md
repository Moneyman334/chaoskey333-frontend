# 🌀 Recursion Monitor & Trigger Package

This package delivers real-time monitoring and control for Vault Recursion in the Omni-Singularity Architecture.

## Environment Variables

```bash
# Recursion Monitor Configuration
NEXT_PUBLIC_REPLAY_TOPIC=vault-broadcast
BROADCAST_ON=false                    # Hard kill-switch (default: OFF)
MAX_RECURSION_DEPTH=4                # Bounded recursion limit
PULSE_QPS_LIMIT=12                   # Rate limiting (pulses per second)
ADMIN_TOKEN=chaos_admin_333          # Admin authentication token
```

## API Endpoints

### `/api/pulse` - Pulse Trigger
- **GET**: Returns system status and metrics
- **POST**: Triggers a pulse event
  ```json
  {
    "depth": 0,
    "source": "manual"
  }
  ```

### `/api/stream` - Real-time SSE Stream
- **GET**: Provides low-latency Server-Sent Events stream
- Returns pulse events, heartbeats, and system status updates

### `/api/toggle-broadcast` - Admin Controls
- **POST**: Toggle broadcast state (requires admin token)
  ```bash
  curl -X POST /api/toggle-broadcast \
    -H "Authorization: Bearer chaos_admin_333"
  ```
- **GET**: Get broadcast status (requires admin token)

## Safety Features

### 1. Default Safety State
- System starts with `BROADCAST_ON=false`
- No recursion occurs until explicitly armed by admin

### 2. Bounded Recursion
- `MAX_RECURSION_DEPTH=4` prevents runaway recursion
- Each recursive pulse increments depth counter
- Recursion stops when max depth reached

### 3. Rate Limiting
- `PULSE_QPS_LIMIT=12` caps pulses per second
- Returns HTTP 429 when limit exceeded
- Protects against pulse storms

### 4. Admin Controls
- Admin token required for broadcast toggle
- Immediate emergency stop capability
- Real-time monitoring of all system parameters

## UI Dashboard

Access the admin dashboard at `/admin`:

### Real-time Metrics
- **System Status**: ARMED/DISARMED state
- **Pulse Metrics**: PPS (Pulses Per Second) and total count
- **Safety Limits**: Current depth and QPS limits
- **Active Connections**: SSE connection count

### Control Panel
- **Trigger Pulse**: Manual pulse initiation
- **ARM/DISARM**: Toggle recursion state (requires admin token)
- **Emergency Stop**: Immediate broadcast disable

### Visualization
- **Ripple Canvas**: Real-time pulse visualization
- **Event Log**: Chronological pulse history
- **Live Updates**: SSE-powered real-time data

## Testing Procedures

### Smoke Test 1: Broadcast OFF (Default)
```bash
# 1. Verify default state
curl http://localhost:3000/api/pulse
# Expected: broadcastOn: false

# 2. Trigger manual pulse
curl -X POST http://localhost:3000/api/pulse \
  -H "Content-Type: application/json" \
  -d '{"depth": 0, "source": "manual"}'
# Expected: willRecurse: false, single pulse only
```

### Smoke Test 2: Armed Recursion (Bounded)
```bash
# 1. ARM recursion (requires admin token)
curl -X POST http://localhost:3000/api/toggle-broadcast \
  -H "Authorization: Bearer chaos_admin_333"
# Expected: broadcastOn: true, message: "Recursion ARMED"

# 2. Trigger recursive pulse
curl -X POST http://localhost:3000/api/pulse \
  -H "Content-Type: application/json" \
  -d '{"depth": 0, "source": "manual"}'
# Expected: willRecurse: true, triggers cascade up to MAX_DEPTH

# 3. Verify bounded recursion
sleep 2
curl http://localhost:3000/api/pulse
# Expected: pulseCount > 1, no runaway recursion

# 4. Emergency DISARM
curl -X POST http://localhost:3000/api/toggle-broadcast \
  -H "Authorization: Bearer chaos_admin_333"
# Expected: broadcastOn: false, recursion stopped
```

## Architecture Notes

### State Management
- Shared state via singleton pattern in `/lib/recursion-state.ts`
- Thread-safe operations for concurrent requests
- Automatic cleanup of stale connections

### Real-time Communication
- Server-Sent Events (SSE) for low-latency updates
- Automatic reconnection on connection loss
- Heartbeat mechanism for connection health

### Security
- Admin token validation for sensitive operations
- Rate limiting prevents abuse
- Bounded recursion prevents infinite loops

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Admin token secured
- [ ] Rate limits appropriate for environment
- [ ] Max recursion depth validated
- [ ] SSE endpoint accessible
- [ ] Admin dashboard accessible at `/admin`
- [ ] Emergency stop procedures documented

## 🚀 Ready for Launch

The system launches with all guardrails active and is designed for safe, monitored recursion with real-time visibility and admin controls.