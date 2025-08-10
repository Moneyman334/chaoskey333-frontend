/**
 * Watchtower Event Emission Endpoint
 * Authenticated injector for internal event calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  WatchtowerConfig, 
  verifyEventSignature, 
  sanitizeEventForClient,
  SignedWatchtowerEvent,
  EventEmissionPayload 
} from '../../../../../lib/watchtower';
import { storeEvent, checkRateLimit, storeEventMetadata } from '../../../../../lib/watchtower-store';
import { broadcastEvent } from '../../../../../lib/sse-manager';

export async function POST(request: NextRequest) {
  try {
    // Check if Watchtower is enabled
    if (!WatchtowerConfig.enabled) {
      return NextResponse.json(
        { error: 'Watchtower is disabled' },
        { status: 503 }
      );
    }

    // Verify signing secret is configured
    if (!WatchtowerConfig.signingSecret) {
      console.error('WATCHTOWER_SIGNING_SECRET not configured');
      return NextResponse.json(
        { error: 'Watchtower not properly configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: EventEmissionPayload = await request.json();
    
    if (!body.event || !body.source) {
      return NextResponse.json(
        { error: 'Missing required fields: event, source' },
        { status: 400 }
      );
    }

    const signedEvent = body.event as SignedWatchtowerEvent;
    
    // Verify event signature
    if (!signedEvent.signature) {
      return NextResponse.json(
        { error: 'Event signature required' },
        { status: 401 }
      );
    }

    const isValidSignature = verifyEventSignature(signedEvent, WatchtowerConfig.signingSecret);
    if (!isValidSignature) {
      console.warn('Invalid event signature detected from source:', body.source);
      return NextResponse.json(
        { error: 'Invalid event signature' },
        { status: 401 }
      );
    }

    // Rate limiting based on event type and source
    const eventTypeLimit = await checkRateLimit(signedEvent.type, 'event_type');
    if (!eventTypeLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Event type rate limit exceeded',
          rateLimitInfo: {
            remaining: eventTypeLimit.remaining,
            resetTime: eventTypeLimit.resetTime
          }
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': eventTypeLimit.remaining.toString(),
            'X-RateLimit-Reset': eventTypeLimit.resetTime.toString(),
          }
        }
      );
    }

    // Additional rate limiting for wallet-specific events
    if (signedEvent.metadata?.walletAddress) {
      const walletLimit = await checkRateLimit(signedEvent.metadata.walletAddress, 'wallet');
      if (!walletLimit.allowed) {
        return NextResponse.json(
          { 
            error: 'Wallet rate limit exceeded',
            rateLimitInfo: {
              remaining: walletLimit.remaining,
              resetTime: walletLimit.resetTime
            }
          },
          { status: 429 }
        );
      }
    }

    // Store event in KV
    await Promise.all([
      storeEvent(signedEvent),
      storeEventMetadata(signedEvent)
    ]);

    // Sanitize event for broadcasting
    const clientEvent = sanitizeEventForClient(signedEvent);

    // Broadcast to all connected SSE clients
    await broadcastEvent({
      ...clientEvent,
      source: body.source,
      receivedAt: Date.now(),
    });

    console.log(`Event ${signedEvent.id} broadcasted from ${body.source}`);

    // Return success response
    return NextResponse.json({
      success: true,
      eventId: signedEvent.id,
      timestamp: signedEvent.timestamp,
      broadcastedAt: Date.now(),
    });

  } catch (error) {
    console.error('Error processing event emission:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  if (!WatchtowerConfig.enabled) {
    return NextResponse.json({ status: 'disabled' }, { status: 503 });
  }

  return NextResponse.json({
    status: 'operational',
    timestamp: Date.now(),
    config: {
      enabled: WatchtowerConfig.enabled,
      hasSigningSecret: !!WatchtowerConfig.signingSecret,
    }
  });
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}