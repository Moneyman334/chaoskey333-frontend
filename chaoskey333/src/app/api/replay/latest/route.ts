// Cosmic Replay Terminal v2.0 - Latest Replay API Endpoint
import { NextResponse } from 'next/server';
import { ReplayVaultStorage } from '@/lib/utils/storage';

export async function GET() {
  try {
    const latestReplay = await ReplayVaultStorage.getLatestReplay();
    
    if (!latestReplay) {
      return NextResponse.json(
        { error: 'No replays found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      replay: latestReplay
    });

  } catch (error) {
    console.error('Failed to fetch latest replay:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed - Use GET' },
    { status: 405 }
  );
}