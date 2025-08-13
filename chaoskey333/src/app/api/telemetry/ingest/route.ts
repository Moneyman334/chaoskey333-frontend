import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv-mock';
import { TelemetryEvent, TelemetryIngestRequest } from '@/types/telemetry';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Fallback to a default IP for local development
  return '127.0.0.1';
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export async function POST(request: NextRequest) {
  try {
    const body: TelemetryIngestRequest = await request.json();
    
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Invalid request: events array is required' },
        { status: 400 }
      );
    }

    const clientIP = getClientIP(request);
    const timestamp = Date.now();
    const dateKey = formatDateKey(new Date(timestamp));

    // Process each event
    const processedEvents: TelemetryEvent[] = body.events.map(event => ({
      ...event,
      timestamp,
      ip: clientIP,
    }));

    // Store raw events with timestamp-based keys for easy retrieval
    const eventKeys: string[] = [];
    for (const event of processedEvents) {
      const eventKey = `telemetry:events:${dateKey}:${timestamp}:${Math.random().toString(36).substr(2, 9)}`;
      eventKeys.push(eventKey);
      await kv.set(eventKey, event, { ex: 60 * 60 * 24 * 90 }); // Store for 90 days
    }

    // Update daily counters for quick rollups
    const pipeline = kv.pipeline();
    for (const event of processedEvents) {
      const counterKey = `telemetry:counter:${dateKey}:${event.type}`;
      pipeline.incr(counterKey);
      pipeline.expire(counterKey, 60 * 60 * 24 * 90); // Expire in 90 days
    }
    
    // Update total counter for the day
    const totalKey = `telemetry:counter:${dateKey}:total`;
    pipeline.incrby(totalKey, processedEvents.length);
    pipeline.expire(totalKey, 60 * 60 * 24 * 90);

    await pipeline.exec();

    return NextResponse.json({
      success: true,
      eventsProcessed: processedEvents.length,
      date: dateKey,
    });

  } catch (error) {
    console.error('Error processing telemetry events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit telemetry events.' },
    { status: 405 }
  );
}