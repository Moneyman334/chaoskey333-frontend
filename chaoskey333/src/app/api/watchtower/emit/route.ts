import { NextRequest, NextResponse } from 'next/server';
import { watchtowerBus, WatchtowerEvent, generateChaosGlyphId, generateEventCode } from '@/lib/watchtower';
import { watchtowerStore } from '@/lib/watchtower-store';
import { MultiChannelPulseSystem, PulseConfig } from '@/lib/multi-channel-pulse';

// Authenticated endpoint for internal event injection with multi-channel pulse
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.WATCHTOWER_AUTH_SECRET || 'default-auth-secret';
    
    if (!authHeader || authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting check
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `emit_rate:${clientIp}`;
    const isAllowed = await watchtowerStore.checkRateLimit(rateLimitKey, 10, 60); // 10 per minute
    
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { type, data, channels } = body;

    // Validate event type
    const validTypes = ['glyph_detection', 'vault_event', 'relic_mint', 'chaos_alert'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Create event
    const event: WatchtowerEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data: {
        glyphId: data.glyphId || generateChaosGlyphId(),
        eventCode: data.eventCode || generateEventCode(),
        vaultUrl: data.vaultUrl,
        timestamp: Date.now(),
        metadata: data.metadata
      },
      channels: channels || ['twitter', 'email', 'sms']
    };

    // Store event
    await watchtowerStore.storeEvent(event);
    await watchtowerStore.addToRecentEvents(event);

    // Emit to SSE subscribers
    watchtowerBus.emit(event);

    // Initialize multi-channel pulse system
    const pulseConfig: PulseConfig = {
      twitter: {
        enabled: process.env.TWITTER_ENABLED === 'true',
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      },
      email: {
        enabled: process.env.EMAIL_ENABLED === 'true',
        smtpHost: process.env.SMTP_HOST,
        smtpUser: process.env.SMTP_USER,
        smtpPass: process.env.SMTP_PASS,
      },
      sms: {
        enabled: process.env.SMS_ENABLED === 'true',
        twilioSid: process.env.TWILIO_SID,
        twilioToken: process.env.TWILIO_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER,
      },
      syncWindow: 5 // 5-second sync window requirement
    };

    // Send multi-channel pulse
    const pulseSystem = new MultiChannelPulseSystem(pulseConfig);
    const pulseResults = await pulseSystem.sendPulse(event);

    console.log(`[Watchtower] Event emitted: ${event.id}`, {
      type: event.type,
      glyphId: event.data.glyphId,
      eventCode: event.data.eventCode,
      pulseResults
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        type: event.type,
        glyphId: event.data.glyphId,
        eventCode: event.data.eventCode,
        timestamp: event.data.timestamp
      },
      pulseResults
    });

  } catch (error: any) {
    console.error('[Watchtower] Event emission failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Test endpoint for manual event triggers
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const testType = url.searchParams.get('test');

  if (!testType) {
    return NextResponse.json({
      message: 'Watchtower Event Emission API',
      usage: 'POST with authentication to emit events',
      testEndpoints: [
        '/api/watchtower/emit?test=glyph',
        '/api/watchtower/emit?test=vault',
        '/api/watchtower/emit?test=relic'
      ]
    });
  }

  // Test event generation (without authentication for testing)
  let testEvent: any = {};

  switch (testType) {
    case 'glyph':
      testEvent = {
        type: 'glyph_detection',
        data: {
          glyphId: generateChaosGlyphId(),
          eventCode: generateEventCode(),
          metadata: { source: 'test_detection', confidence: 0.95 }
        },
        channels: ['twitter']
      };
      break;

    case 'vault':
      testEvent = {
        type: 'vault_event',
        data: {
          eventCode: generateEventCode(),
          metadata: { vaultId: 'test_vault_001', activity: 'access_detected' }
        },
        channels: ['email']
      };
      break;

    case 'relic':
      testEvent = {
        type: 'relic_mint',
        data: {
          glyphId: generateChaosGlyphId(),
          eventCode: generateEventCode(),
          metadata: { tokenId: '123', minter: '0x...test' }
        },
        channels: ['sms']
      };
      break;

    default:
      return NextResponse.json(
        { error: 'Invalid test type' },
        { status: 400 }
      );
  }

  return NextResponse.json({
    message: `Test event for ${testType}`,
    testEvent,
    note: 'Use POST with proper authentication to actually emit this event'
  });
}