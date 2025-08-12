import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { TelemetryRollup, TelemetryManualRollupRequest, TelemetryManualRollupResponse } from '@/types/telemetry';

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date.toISOString().split('T')[0] === dateString;
}

function getDateRange(startDate?: string, endDate?: string): string[] {
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date();
  
  // If no dates provided, default to last 7 days
  if (!startDate && !endDate) {
    start.setDate(start.getDate() - 6); // Last 7 days including today
  }
  
  const dates: string[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    dates.push(formatDateKey(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

async function computeRollupForDate(dateKey: string): Promise<TelemetryRollup | null> {
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

  // If no events found, return null
  if (totalEvents === 0) {
    return null;
  }

  return {
    date: dateKey,
    events,
    totalEvents,
    lastUpdated: Date.now(),
  };
}

function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminToken = process.env.ADMIN_TOKEN;
  
  if (!adminToken) {
    console.warn('ADMIN_TOKEN environment variable not set');
    return false;
  }
  
  if (!authHeader) {
    return false;
  }
  
  // Support both "Bearer token" and "token" formats
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;
  
  return token === adminToken;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Valid admin token required.' },
        { status: 401 }
      );
    }

    const body: TelemetryManualRollupRequest = await request.json().catch(() => ({}));
    const { startDate, endDate, saveSnapshot = false } = body;

    // Validate date parameters if provided
    if (startDate && !isValidDate(startDate)) {
      return NextResponse.json(
        { error: 'Invalid startDate format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    if (endDate && !isValidDate(endDate)) {
      return NextResponse.json(
        { error: 'Invalid endDate format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Get date range
    const dates = getDateRange(startDate, endDate);
    const rollups: TelemetryRollup[] = [];

    // Compute rollups for each date
    for (const dateKey of dates) {
      const rollup = await computeRollupForDate(dateKey);
      if (rollup) {
        rollups.push(rollup);
        
        // Cache the rollup
        await kv.set(`telemetry:rollup:${dateKey}`, rollup, { ex: 60 * 60 * 24 }); // Cache for 24 hours
      }
    }

    let snapshotSaved = false;

    // Save snapshot if requested
    if (saveSnapshot && rollups.length > 0) {
      const snapshot = {
        createdAt: Date.now(),
        dateRange: {
          start: dates[0],
          end: dates[dates.length - 1],
        },
        rollups,
        totalEvents: rollups.reduce((sum, r) => sum + r.totalEvents, 0),
      };

      const snapshotKey = `telemetry:snapshot:${Date.now()}`;
      await kv.set(snapshotKey, snapshot, { ex: 60 * 60 * 24 * 365 }); // Keep snapshots for 1 year
      snapshotSaved = true;
    }

    const response: TelemetryManualRollupResponse = {
      success: true,
      rollups,
      snapshotSaved,
      message: `Successfully computed ${rollups.length} rollup(s) for ${dates.length} date(s)${snapshotSaved ? ' and saved snapshot' : ''}`,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error performing manual rollup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to trigger manual rollup.' },
    { status: 405 }
  );
}