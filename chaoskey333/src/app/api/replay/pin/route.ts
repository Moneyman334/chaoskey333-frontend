// Cosmic Replay Terminal v2.0 - Pin/Archive Replay API Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { ReplayVaultStorage } from '@/lib/utils/storage';
import { ReplayPinRequest } from '@/lib/types/replay';

export async function POST(request: NextRequest) {
  try {
    const body: ReplayPinRequest = await request.json();
    
    // Validate admin token
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken || body.adminToken !== adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin token' },
        { status: 401 }
      );
    }

    if (!body.replayId) {
      return NextResponse.json(
        { error: 'Replay ID is required' },
        { status: 400 }
      );
    }

    // Check if replay exists
    const replay = await ReplayVaultStorage.getManifest(body.replayId);
    if (!replay) {
      return NextResponse.json(
        { error: 'Replay not found' },
        { status: 404 }
      );
    }

    if (body.archiveAssets) {
      // Mock archive URL generation - in real implementation, upload to S3/Backblaze
      const archiveUrl = `https://archive.chaoskey333.com/replays/${body.replayId}.zip`;
      
      // Archive the replay assets
      await ReplayVaultStorage.archiveReplay(body.replayId, archiveUrl);
      
      // Add to featured list
      await ReplayVaultStorage.addToFeatured(body.replayId);

      return NextResponse.json({
        success: true,
        message: 'Replay archived and pinned successfully',
        archiveUrl: archiveUrl
      });
    } else {
      // Just add to featured list without archiving
      await ReplayVaultStorage.addToFeatured(body.replayId);

      return NextResponse.json({
        success: true,
        message: 'Replay pinned successfully'
      });
    }

  } catch (error) {
    console.error('Failed to pin replay:', error);
    return NextResponse.json(
      { error: 'Internal server error during pin operation' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed - Use POST' },
    { status: 405 }
  );
}