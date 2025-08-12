// Cosmic Replay Terminal v2.0 - Automated Rollup Cron Job
import { NextRequest, NextResponse } from 'next/server';
import { ReplayAggregator } from '@/lib/utils/aggregator';

export async function GET(request: NextRequest) {
  try {
    // Verify this is coming from Vercel's cron system
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting automated replay rollup...');

    // Check if we should trigger an activity-based rollup
    const shouldTriggerActivity = await ReplayAggregator.shouldTriggerActivityRollup();
    
    if (shouldTriggerActivity) {
      console.log('High activity detected, creating activity-based rollup');
    }

    // Create the rollup
    const manifest = await ReplayAggregator.createReplayRollup();

    console.log(`Rollup created successfully: ${manifest.id}`);

    return NextResponse.json({
      success: true,
      replayId: manifest.id,
      triggered: shouldTriggerActivity ? 'activity' : 'scheduled',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron rollup failed:', error);
    return NextResponse.json(
      { error: 'Internal server error during automated rollup' },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed - This is a cron endpoint' },
    { status: 405 }
  );
}