/**
 * Test endpoint for Watchtower system
 */

import { NextRequest, NextResponse } from 'next/server';
import { testWatchtowerSystem, ServerEventEmitters } from '../../../../lib/watchtower-emitter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const testType = body.testType || 'system';

    let result = false;

    switch (testType) {
      case 'system':
        result = await testWatchtowerSystem();
        break;
      
      case 'payment':
        result = await ServerEventEmitters.paymentSuccess(
          'test-session-123',
          3300, // $33.00
          '0x742d35Cc6660C02782c67c81eCf24Fc0A33c1234'
        );
        break;
      
      case 'relic':
        result = await ServerEventEmitters.relicMinted(
          'relic-token-456',
          '0x742d35Cc6660C02782c67c81eCf24Fc0A33c1234',
          'Chaos Key Fragment'
        );
        break;
      
      case 'leaderboard':
        result = await ServerEventEmitters.leaderboardUpdate(
          '0x742d35Cc6660C02782c67c81eCf24Fc0A33c1234',
          5, // new rank
          12 // old rank
        );
        break;
      
      case 'glyph':
        result = await ServerEventEmitters.glyphAlert(
          'cosmic-alignment',
          'Cosmic alignment detected! Vault energies are surging.',
          'high'
        );
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result,
      testType,
      timestamp: Date.now(),
      message: result ? 'Test event emitted successfully' : 'Test event failed to emit'
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Watchtower Test Endpoint',
    availableTests: [
      'system',
      'payment', 
      'relic',
      'leaderboard',
      'glyph'
    ],
    usage: 'POST with { "testType": "system" }'
  });
}