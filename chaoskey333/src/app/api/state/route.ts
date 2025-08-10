import { NextRequest, NextResponse } from 'next/server';
import { getState, getStateSnapshot } from '@/lib/state';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeSnapshot = searchParams.get('snapshot') === 'true';
    
    if (includeSnapshot) {
      const snapshot = await getStateSnapshot();
      return NextResponse.json(snapshot);
    } else {
      const state = await getState();
      return NextResponse.json({
        state,
        timestamp: Date.now()
      });
    }

  } catch (error) {
    console.error('State API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve state' },
      { status: 500 }
    );
  }
}

// For webhook/SSE support, return state changes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lastUpdated } = body;
    
    const currentState = await getState();
    
    // Check if state has been updated since last check
    if (lastUpdated && currentState.system.lastUpdated <= lastUpdated) {
      return NextResponse.json({
        hasUpdates: false,
        timestamp: Date.now()
      });
    }
    
    return NextResponse.json({
      hasUpdates: true,
      state: currentState,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('State polling error:', error);
    return NextResponse.json(
      { error: 'Failed to check state updates' },
      { status: 500 }
    );
  }
}