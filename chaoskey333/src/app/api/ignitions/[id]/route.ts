import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv-mock';
import { IgnitionEvent } from '@/types/ignition';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Ignition ID is required' },
        { status: 400 }
      );
    }
    
    // Get ignition event from KV
    const ignitionKey = `ignition:${id}`;
    const ignition = (await kv.get(ignitionKey) as IgnitionEvent);
    
    if (!ignition) {
      return NextResponse.json(
        { error: 'Ignition not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(ignition);
    
  } catch (error) {
    console.error('Error fetching ignition:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ignition event' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to retrieve ignition details.' },
    { status: 405 }
  );
}