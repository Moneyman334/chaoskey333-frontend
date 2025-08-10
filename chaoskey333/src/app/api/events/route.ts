import { NextRequest, NextResponse } from 'next/server';
import { getEvents, getEventsSince, getEventsByType, getEventsByActor, getEventStats } from '@/lib/events';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const since = searchParams.get('since');
    const type = searchParams.get('type');
    const actor = searchParams.get('actor');
    const limit = parseInt(searchParams.get('limit') || '50');
    const stats = searchParams.get('stats') === 'true';
    const beforeSequence = searchParams.get('beforeSequence');
    const afterSequence = searchParams.get('afterSequence');

    // Handle stats request
    if (stats) {
      const eventStats = await getEventStats();
      return NextResponse.json(eventStats);
    }

    let events;
    
    if (since) {
      // Get events since timestamp
      const sinceTimestamp = parseInt(since);
      events = await getEventsSince(sinceTimestamp, limit);
    } else if (type) {
      // Get events by type
      events = await getEventsByType(type, limit);
    } else if (actor) {
      // Get events by actor
      events = await getEventsByActor(actor, limit);
    } else {
      // Get events with optional sequence filtering
      const options: {
        limit: number;
        beforeSequence?: number;
        afterSequence?: number;
      } = { limit };
      
      if (beforeSequence) {
        options.beforeSequence = parseInt(beforeSequence);
      }
      
      if (afterSequence) {
        options.afterSequence = parseInt(afterSequence);
      }
      
      events = await getEvents(options);
    }

    // Return events with metadata
    return NextResponse.json({
      events,
      count: events.length,
      timestamp: Date.now(),
      params: {
        since: since ? parseInt(since) : null,
        type,
        actor,
        limit,
        beforeSequence: beforeSequence ? parseInt(beforeSequence) : null,
        afterSequence: afterSequence ? parseInt(afterSequence) : null
      }
    });

  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve events' },
      { status: 500 }
    );
  }
}

// Server-Sent Events endpoint for real-time updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lastSequence, types } = body;
    
    // Get new events since last sequence
    const events = await getEvents({
      afterSequence: lastSequence || 0,
      limit: 100
    });

    // Filter by types if specified
    const filteredEvents = types 
      ? events.filter(event => types.includes(event.type))
      : events;

    return NextResponse.json({
      events: filteredEvents,
      latestSequence: filteredEvents.length > 0 
        ? Math.max(...filteredEvents.map(e => e.sequence))
        : lastSequence || 0,
      hasMore: filteredEvents.length === 100,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Events polling error:', error);
    return NextResponse.json(
      { error: 'Failed to poll events' },
      { status: 500 }
    );
  }
}