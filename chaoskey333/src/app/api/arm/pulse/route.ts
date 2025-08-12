import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

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

const PROBES: ProbeConfig[] = [
  {
    name: 'kv_set_get',
    target_p99: 250, // ms
    description: 'KV operations (set/get cycle)'
  },
  {
    name: 'overlay_sync',
    target_p99: 350, // ms
    description: 'Overlay synchronization'
  },
  {
    name: 'autosave_roundtrip',
    target_p99: 2000, // ms
    description: 'Auto-save recovery round-trip'
  }
];

// Store recent samples in memory for quick access
// In production, this could be stored in KV for persistence
let recentSamples: PerformanceSample[] = [];
const MAX_SAMPLES = 1000;

export async function POST(request: NextRequest) {
  try {
    const { probe, latency, status = 'success' } = await request.json();

    if (!probe || typeof latency !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: probe, latency' },
        { status: 400 }
      );
    }

    const sample: PerformanceSample = {
      timestamp: Date.now(),
      probe,
      latency,
      status
    };

    // Add to recent samples
    recentSamples.push(sample);
    
    // Keep only the most recent samples
    if (recentSamples.length > MAX_SAMPLES) {
      recentSamples = recentSamples.slice(-MAX_SAMPLES);
    }

    // Optionally store in KV for persistence (commented out for now)
    // if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    //   const key = `arm:samples:${probe}:${sample.timestamp}`;
    //   await kv.set(key, sample, { ex: 3600 }); // Expire after 1 hour
    // }

    return NextResponse.json({ success: true, sample });
  } catch (error) {
    console.error('ARM Pulse Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const probe = url.searchParams.get('probe');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    let samples = recentSamples;
    
    if (probe) {
      samples = samples.filter(s => s.probe === probe);
    }

    // Get the most recent samples
    const recentSamplesData = samples
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      samples: recentSamplesData,
      probes: PROBES,
      total: samples.length
    });
  } catch (error) {
    console.error('ARM Pulse GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}