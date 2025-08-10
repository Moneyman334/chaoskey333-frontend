import { NextResponse } from 'next/server';

// Mock pulse data for development
const mockPulseData = {
  timestamp: new Date().toISOString(),
  live_nodes: ['PR-23'],
  mutating_nodes: ['PR-24'], 
  archived_nodes: ['PR-18'],
  active_viewers: 42,
  recent_activity: [
    {
      node_id: 'PR-23',
      event: 'viewer_joined',
      timestamp: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
    },
    {
      node_id: 'PR-24',
      event: 'mutation_detected',
      timestamp: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
    }
  ]
};

export async function GET() {
  try {
    // In production, this would fetch from Vercel KV with 30s cache
    // const pulse = await kv.get('kv:pulse:latest') || mockPulseData;
    
    return NextResponse.json({
      ...mockPulseData,
      cached: true,
      ttl: 30
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error('Error fetching pulse data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pulse data' },
      { status: 500 }
    );
  }
}