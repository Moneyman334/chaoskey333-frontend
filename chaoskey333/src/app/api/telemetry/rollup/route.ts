import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv-mock';
import { TelemetryRollup, TelemetryRollupResponse } from '@/types/telemetry';

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date.toISOString().split('T')[0] === dateString;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required (format: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    if (!isValidDate(dateParam)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const dateKey = dateParam;

    // Check if we have a pre-computed rollup
    const rollupKey = `telemetry:rollup:${dateKey}`;
    const existingRollup = (await kv.get(rollupKey) as TelemetryRollup);

    if (existingRollup) {
      const response: TelemetryRollupResponse = {
        date: dateKey,
        rollup: existingRollup,
      };
      return NextResponse.json(response);
    }

    // Compute rollup from counters
    const eventTypes = ['page_view', 'mint_success', 'checkout_start', 'wallet_connect', 'custom'];
    const events: Record<string, number> = {};
    let totalEvents = 0;

    // Get all counters for the date
    const pipeline = kv.pipeline();
    for (const eventType of eventTypes) {
      pipeline.get(`telemetry:counter:${dateKey}:${eventType}`);
    }
    pipeline.get(`telemetry:counter:${dateKey}:total`);

    const results = await pipeline.exec();
    
    // Process results
    for (let i = 0; i < eventTypes.length; i++) {
      const count = (results[i] as number) || 0;
      if (count > 0) {
        events[eventTypes[i]] = count;
      }
    }

    totalEvents = (results[eventTypes.length] as number) || 0;

    // If no events found, return null rollup
    if (totalEvents === 0) {
      const response: TelemetryRollupResponse = {
        date: dateKey,
        rollup: null,
      };
      return NextResponse.json(response);
    }

    // Create rollup object
    const rollup: TelemetryRollup = {
      date: dateKey,
      events,
      totalEvents,
      lastUpdated: Date.now(),
    };

    // Cache the rollup for future requests (expire in 1 hour)
    await kv.set(rollupKey, rollup, { ex: 60 * 60 });

    const response: TelemetryRollupResponse = {
      date: dateKey,
      rollup,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching telemetry rollup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch rollup data.' },
    { status: 405 }
  );
}