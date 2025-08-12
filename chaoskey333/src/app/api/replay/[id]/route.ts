// Cosmic Replay Terminal v2.0 - Get Replay by ID API Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { ReplayVaultStorage } from '@/lib/utils/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Replay ID is required' },
        { status: 400 }
      );
    }

    const replay = await ReplayVaultStorage.getManifest(id);
    
    if (!replay) {
      return NextResponse.json(
        { error: 'Replay not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      replay: replay
    });

  } catch (error) {
    console.error('Failed to fetch replay:', error);
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