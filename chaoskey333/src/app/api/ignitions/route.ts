import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv-mock';
import { IgnitionEvent, IgnitionListResponse } from '@/types/ignition';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100); // Max 100 per page
    const date = searchParams.get('date'); // Optional date filter (YYYY-MM-DD)
    
    let ignitionIds: string[] = [];
    
    if (date) {
      // Get ignitions for specific date
      const dateKey = `ignitions:date:${date}`;
      ignitionIds = (await kv.get(dateKey) as string[]) || [];
    } else {
      // Get all ignitions from general index
      const indexKey = `ignitions:index`;
      ignitionIds = (await kv.get(indexKey) as string[]) || [];
    }
    
    // Calculate pagination
    const total = ignitionIds.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedIds = ignitionIds.slice(startIndex, endIndex);
    
    // Fetch ignition events
    const ignitions: IgnitionEvent[] = [];
    
    for (const id of paginatedIds) {
      const ignitionKey = `ignition:${id}`;
      const ignition = (await kv.get(ignitionKey) as IgnitionEvent);
      if (ignition) {
        ignitions.push(ignition);
      }
    }
    
    const response: IgnitionListResponse = {
      ignitions,
      total,
      page,
      pageSize
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching ignitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ignition events' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to list ignitions or POST to /api/ignite to create one.' },
    { status: 405 }
  );
}