import { NextRequest, NextResponse } from 'next/server';
import { recursionState } from '@/lib/recursion-state';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'chaos_admin_333';

export async function POST(request: NextRequest) {
  try {
    // Check for admin token in headers or body
    const authHeader = request.headers.get('Authorization');
    const body = await request.json().catch(() => ({}));
    
    const token = authHeader?.replace('Bearer ', '') || body.token;

    if (token !== ADMIN_TOKEN) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Valid admin token required'
      }, { status: 401 });
    }

    // Toggle the broadcast state
    const newState = recursionState.toggleBroadcast();

    const response = {
      success: true,
      broadcastOn: newState,
      action: newState ? 'enabled' : 'disabled',
      timestamp: Date.now(),
      message: `Broadcast ${newState ? 'ENABLED' : 'DISABLED'} - Recursion ${newState ? 'ARMED' : 'DISARMED'}`
    };

    // Broadcast the state change to all SSE connections
    const broadcastEvent = {
      id: `toggle_${Date.now()}`,
      timestamp: Date.now(),
      depth: 0,
      source: 'admin',
      broadcastOn: newState,
      recursionDepth: 0,
      pulseCount: recursionState.pulseCount,
      pps: recursionState.getCurrentPPS(),
      topic: process.env.NEXT_PUBLIC_REPLAY_TOPIC || 'vault-broadcast',
      type: 'broadcast_toggle',
      action: response.action,
      message: response.message
    };
    
    recursionState.broadcastToSSE(broadcastEvent as any);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Toggle broadcast error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check for admin token for status
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== ADMIN_TOKEN) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Valid admin token required for status'
      }, { status: 401 });
    }

    const status = recursionState.getStatus();
    return NextResponse.json({
      ...status,
      status: status.broadcastOn ? 'ARMED' : 'DISARMED',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Get broadcast status error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}