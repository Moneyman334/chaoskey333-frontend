import { NextRequest } from 'next/server';

interface PerformanceSample {
  timestamp: number;
  probe: string;
  latency: number;
  status: 'success' | 'error';
}

interface ProbeConfig {
  name: string;
  target_p99: number;
  description: string;
}

// Import these from the pulse endpoint (in a real app, these would be in a shared module)
const PROBES: ProbeConfig[] = [
  {
    name: 'kv_set_get',
    target_p99: 250,
    description: 'KV operations (set/get cycle)'
  },
  {
    name: 'overlay_sync',
    target_p99: 350,
    description: 'Overlay synchronization'
  },
  {
    name: 'autosave_roundtrip',
    target_p99: 2000,
    description: 'Auto-save recovery round-trip'
  }
];

// In a real implementation, this would be shared state
// For now, we'll create a simple mock data generator
function generateMockSample(probe: string): PerformanceSample {
  const config = PROBES.find(p => p.name === probe);
  if (!config) {
    throw new Error(`Unknown probe: ${probe}`);
  }
  
  // Generate realistic latency values with some variation
  const baseLatency = config.target_p99 * 0.6; // Base around 60% of target
  const variation = config.target_p99 * 0.4; // Variation up to 40% of target
  const latency = baseLatency + (Math.random() * variation);
  
  return {
    timestamp: Date.now(),
    probe,
    latency: Math.round(latency),
    status: Math.random() > 0.05 ? 'success' : 'error' // 5% error rate
  };
}

function calculatePercentiles(values: number[]): { p50: number; p90: number; p99: number } {
  if (values.length === 0) {
    return { p50: 0, p90: 0, p99: 0 };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const len = sorted.length;
  
  const p50Index = Math.floor(len * 0.5);
  const p90Index = Math.floor(len * 0.9);
  const p99Index = Math.floor(len * 0.99);
  
  return {
    p50: sorted[p50Index] || 0,
    p90: sorted[p90Index] || 0,
    p99: sorted[p99Index] || 0
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cadence = parseInt(searchParams.get('cadence') || '2000'); // Default 2 seconds
  
  // Set up Server-Sent Events
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Store recent samples for percentile calculation
  const recentSamples: { [probe: string]: number[] } = {};
  PROBES.forEach(probe => {
    recentSamples[probe.name] = [];
  });

  // Function to send SSE data
  const sendData = async (data: any) => {
    const sseData = `data: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(sseData));
  };

  // Start streaming
  const startStreaming = async () => {
    try {
      // Send initial connection message
      await sendData({
        type: 'connected',
        timestamp: Date.now(),
        message: 'ARM Stress Console Stream Connected'
      });

      // Main streaming loop
      const intervalId = setInterval(async () => {
        try {
          const metrics: any = {};
          
          // Generate samples for each probe and calculate percentiles
          for (const probe of PROBES) {
            // Generate a new sample
            const sample = generateMockSample(probe.name);
            
            // Add to recent samples (keep last 100 samples for percentile calculation)
            recentSamples[probe.name].push(sample.latency);
            if (recentSamples[probe.name].length > 100) {
              recentSamples[probe.name].shift();
            }
            
            // Calculate percentiles
            const percentiles = calculatePercentiles(recentSamples[probe.name]);
            
            metrics[probe.name] = {
              ...percentiles,
              target_p99: probe.target_p99,
              description: probe.description,
              latest_sample: sample,
              breach: percentiles.p99 > probe.target_p99
            };
          }

          await sendData({
            type: 'metrics',
            timestamp: Date.now(),
            metrics
          });
        } catch (error) {
          console.error('Streaming error:', error);
          await sendData({
            type: 'error',
            timestamp: Date.now(),
            message: 'Error generating metrics'
          });
        }
      }, cadence);

      // Clean up on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        writer.close();
      });
      
    } catch (error) {
      console.error('Stream initialization error:', error);
      await sendData({
        type: 'error',
        timestamp: Date.now(),
        message: 'Failed to initialize stream'
      });
      writer.close();
    }
  };

  // Start the streaming process
  startStreaming();

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    },
  });
}