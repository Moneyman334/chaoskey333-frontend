import { NextRequest, NextResponse } from 'next/server';
import { commandBus } from '@/lib/commandBus';
import type { Command } from '@/lib/commandBus';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Command;
    
    // Basic validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields: (keyof Command)[] = ['type', 'idempotencyKey', 'timestamp', 'actor', 'signature'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Execute command through command bus
    const result = await commandBus.executeCommand(body);
    
    if (!result.success) {
      const statusCode = getStatusCodeForError(result.message);
      return NextResponse.json(
        { 
          error: result.message,
          data: result.data 
        },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
      eventId: result.eventId,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Command API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST to execute commands.',
      supportedCommands: [
        'REPLAY.START',
        'REPLAY.STOP',
        'HUD.DECODE.ENABLE', 
        'HUD.DECODE.DISABLE',
        'RELIC.EVOLVE.TRIGGER',
        'BROADCAST.PULSE',
        'MINT.GATE.OPEN',
        'MINT.GATE.CLOSE'
      ]
    },
    { status: 405 }
  );
}

function getStatusCodeForError(message: string): number {
  if (message.includes('Invalid signature')) {
    return 401; // Unauthorized
  }
  if (message.includes('Insufficient permissions')) {
    return 403; // Forbidden
  }
  if (message.includes('already processed')) {
    return 409; // Conflict
  }
  if (message.includes('Rate limit exceeded')) {
    return 429; // Too Many Requests
  }
  if (message.includes('Invalid command')) {
    return 400; // Bad Request
  }
  return 500; // Internal Server Error
}