import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv-mock';
import { 
  IgnitionEvent, 
  IgnitionTriggerRequest, 
  IgnitionTriggerResponse,
  CANONICAL_SEQUENCE 
} from '@/types/ignition';

export async function POST(request: NextRequest) {
  try {
    const body: IgnitionTriggerRequest = await request.json();
    
    // Generate unique ID for the ignition
    const ignitionId = `ignition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    
    // Use provided sequence or default canonical sequence
    const sequence = body.sequence || CANONICAL_SEQUENCE;
    
    // Create ignition event
    const ignitionEvent: IgnitionEvent = {
      id: ignitionId,
      timestamp,
      sequence,
      metadata: {
        triggeredBy: body.metadata?.triggeredBy || 'unknown',
        duration: body.metadata?.duration || getTotalDuration(sequence),
        intensity: body.metadata?.intensity || 1.0,
        ...body.metadata
      }
    };
    
    // Store in KV with multiple keys for different access patterns
    const ignitionKey = `ignition:${ignitionId}`;
    const indexKey = `ignitions:index`;
    const dateKey = `ignitions:date:${new Date(timestamp).toISOString().split('T')[0]}`;
    
    // Store the ignition event
    await kv.set(ignitionKey, ignitionEvent);
    
    // Add to general index (store list of IDs)
    const existingIndex = (await kv.get(indexKey) as string[]) || [];
    existingIndex.unshift(ignitionId); // Add to beginning for newest first
    
    // Keep only last 1000 ignitions in index
    if (existingIndex.length > 1000) {
      existingIndex.splice(1000);
    }
    
    await kv.set(indexKey, existingIndex);
    
    // Add to date-specific index
    const existingDateIndex = (await kv.get(dateKey) as string[]) || [];
    existingDateIndex.unshift(ignitionId);
    await kv.set(dateKey, existingDateIndex, { ex: 60 * 60 * 24 * 30 }); // Expire in 30 days
    
    // Increment counters for telemetry integration
    const today = new Date().toISOString().split('T')[0];
    await kv.incr(`telemetry:counter:${today}:ignition_triggered`);
    await kv.incr(`telemetry:counter:${today}:total`);
    
    const response: IgnitionTriggerResponse = {
      success: true,
      ignition: ignitionEvent,
      message: `Cosmic Ignition Sequence ${ignitionId} triggered successfully`
    };
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('Error triggering ignition:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to trigger cosmic ignition sequence',
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to trigger ignition.' },
    { status: 405 }
  );
}

function getTotalDuration(sequence: string[]): number {
  // Calculate total duration based on sequence length
  // This is a placeholder - actual duration will be calculated in the component
  return sequence.length * 3000; // 3 seconds per step average
}