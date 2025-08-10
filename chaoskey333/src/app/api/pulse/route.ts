import { NextRequest, NextResponse } from 'next/server';
import { recursionState, PulseEvent } from '@/lib/recursion-state';

const replayTopic = process.env.NEXT_PUBLIC_REPLAY_TOPIC || 'vault-broadcast';
const maxRecursionDepth = parseInt(process.env.MAX_RECURSION_DEPTH || '4');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { depth = 0, source = 'manual' } = body;

    const now = Date.now();
    
    // Check QPS limit
    if (!recursionState.canPulse()) {
      return NextResponse.json({
        error: 'QPS limit exceeded',
        limit: parseInt(process.env.PULSE_QPS_LIMIT || '12'),
        current_pps: recursionState.getCurrentPPS()
      }, { status: 429 });
    }

    // Record this pulse
    recursionState.addPulse();

    const pulseEvent: PulseEvent = {
      id: `pulse_${now}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now,
      depth: depth,
      source,
      broadcastOn: recursionState.broadcastOn,
      recursionDepth: depth,
      pulseCount: recursionState.pulseCount,
      pps: recursionState.getCurrentPPS(),
      topic: replayTopic
    };

    // Broadcast to SSE connections
    recursionState.broadcastToSSE(pulseEvent);

    // Trigger recursion if broadcast is on and within depth limits
    if (recursionState.broadcastOn && depth < maxRecursionDepth) {
      // Trigger recursive pulse after small delay
      setTimeout(async () => {
        try {
          await fetch(`${request.nextUrl.origin}/api/pulse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              depth: depth + 1,
              source: 'recursive'
            })
          });
        } catch (error) {
          console.error('Recursive pulse failed:', error);
        }
      }, 100); // Small delay to prevent stack overflow
    }

    return NextResponse.json({
      success: true,
      event: pulseEvent,
      willRecurse: recursionState.broadcastOn && depth < maxRecursionDepth,
      limits: {
        maxDepth: maxRecursionDepth,
        qpsLimit: parseInt(process.env.PULSE_QPS_LIMIT || '12'),
        currentPps: recursionState.getCurrentPPS()
      }
    });

  } catch (error) {
    console.error('Pulse API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(recursionState.getStatus());
}