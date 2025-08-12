// Cosmic Replay Terminal v2.0 - Rollup API Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { ReplayAggregator } from '@/lib/utils/aggregator';
import { ReplayRollupRequest } from '@/lib/types/replay';

export async function POST(request: NextRequest) {
  try {
    const body: ReplayRollupRequest = await request.json();
    
    // Validate admin token
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken || body.adminToken !== adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin token' },
        { status: 401 }
      );
    }

    // Parse optional time parameters
    let startTime: Date | undefined;
    let endTime: Date | undefined;
    
    if (body.startTime) {
      startTime = new Date(body.startTime);
      if (isNaN(startTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid startTime format' },
          { status: 400 }
        );
      }
    }
    
    if (body.endTime) {
      endTime = new Date(body.endTime);
      if (isNaN(endTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid endTime format' },
          { status: 400 }
        );
      }
    }

    // Create replay rollup
    const manifest = await ReplayAggregator.createReplayRollup(
      startTime,
      endTime,
      body.forced || false
    );

    return NextResponse.json({
      success: true,
      replayId: manifest.id,
      manifest: manifest
    });

  } catch (error) {
    console.error('Rollup creation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error during rollup creation' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed - Use POST' },
    { status: 405 }
  );
}