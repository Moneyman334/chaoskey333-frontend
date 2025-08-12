# ARM Stress Console - Deployment Guide

This document provides deployment instructions for the ARM Stress Console implementation.

## Environment Variables

Set the following environment variables in your Vercel deployment:

```bash
# Required for thirdweb integration
NEXT_PUBLIC_TEMPLATE_CLIENT_ID=your_thirdweb_client_id

# ARM Stress Console Configuration
NEXT_PUBLIC_BASE_URL=https://your-production-url.vercel.app
KV_REST_API_URL=your_vercel_kv_rest_api_url
KV_REST_API_TOKEN=your_vercel_kv_rest_api_token
```

## Deployment Steps

1. **Set Environment Variables in Vercel**:
   ```bash
   vercel env add NEXT_PUBLIC_BASE_URL
   vercel env add KV_REST_API_URL
   vercel env add KV_REST_API_TOKEN
   ```

2. **Deploy to Production**:
   ```bash
   vercel --prod --confirm --name=chaoskey333-casino
   ```

3. **Access the ARM Stress Console**:
   Navigate to `/arm` on your deployed URL.

## API Endpoints

### `/api/arm/stream`
- **Method**: GET
- **Description**: Server-Sent Events stream for real-time performance metrics
- **Query Parameters**:
  - `cadence` (optional): Update interval in milliseconds (default: 2000)

### `/api/arm/pulse`
- **Method**: POST
- **Description**: Submit performance samples
- **Body**:
  ```json
  {
    "probe": "kv_set_get|overlay_sync|autosave_roundtrip",
    "latency": 150,
    "status": "success|error"
  }
  ```

- **Method**: GET
- **Description**: Retrieve stored performance samples
- **Query Parameters**:
  - `probe` (optional): Filter by specific probe
  - `limit` (optional): Number of samples to return (default: 100)

## Performance Targets

- **kv_set_get**: p99 < 250ms
- **overlay_sync**: p99 < 350ms  
- **autosave_roundtrip**: p99 < 2000ms (total app recovery < 5s)

## Features

- ✅ Real-time SSE streaming every ~2 seconds
- ✅ Live p50/p90/p99 percentile calculations
- ✅ Performance target monitoring with visual indicators
- ✅ Recent samples table with timestamps and status
- ✅ Connection status indicators
- ✅ Dark-themed professional UI
- ✅ Mock data generation for testing
- ✅ Customizable stream cadence
- ✅ Easy probe configuration

## Customization

### Adding New Probes

Edit the `PROBES` array in both API files:

```typescript
const PROBES: ProbeConfig[] = [
  {
    name: 'your_new_probe',
    target_p99: 500, // ms
    description: 'Description of your probe'
  }
];
```

### Adjusting Stream Cadence

The stream cadence can be adjusted by modifying the default in `/api/arm/stream`:

```typescript
const cadence = parseInt(searchParams.get('cadence') || '2000'); // 2 seconds default
```

### KV Storage (Optional)

To enable KV storage for historical data, uncomment the KV storage lines in `/api/arm/pulse/route.ts`:

```typescript
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  const key = `arm:samples:${probe}:${sample.timestamp}`;
  await kv.set(key, sample, { ex: 3600 }); // Expire after 1 hour
}
```

## Monitoring in Production

Once deployed, the ARM Stress Console will provide live visibility into the neutron-star pulse of the Cosmic Replay Terminal during Phase 1 of the stress-test ignition.

Access the console at: `https://your-deployment-url.vercel.app/arm`