import { NextResponse } from 'next/server';

// Mock replay data for development
const mockReplays = [
  {
    id: 'PR-18',
    pr: 18,
    title: 'Cosmic Authentication Flow',
    duration: 180,
    tags: ['auth', 'cosmic', 'golden'],
    locales: ['en', 'es'],
    createdAt: '2024-01-15T10:00:00Z',
    status: 'ARCHIVED'
  },
  {
    id: 'PR-23',
    pr: 23,
    title: 'Spectral Decode Implementation',
    duration: 240,
    tags: ['spectral', 'decode', 'glyph'],
    locales: ['en'],
    createdAt: '2024-01-20T14:30:00Z',
    status: 'LIVE'
  },
  {
    id: 'PR-24',
    pr: 24,
    title: 'Glyph Overlay System',
    duration: 320,
    tags: ['glyph', 'overlay', 'ui'],
    locales: ['en', 'fr'],
    createdAt: '2024-01-22T09:15:00Z',
    status: 'MUTATING'
  }
];

export async function GET() {
  try {
    // In production, this would fetch from Vercel KV
    // const replays = await kv.get('kv:replay:index') || [];
    
    return NextResponse.json({
      replays: mockReplays,
      total: mockReplays.length,
      cached: true
    });
  } catch (error) {
    console.error('Error fetching replays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch replays' },
      { status: 500 }
    );
  }
}

// Admin endpoint for adding new replays
export async function POST(request: Request) {
  try {
    const adminToken = request.headers.get('ADMIN_TOKEN');
    
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const replayData = await request.json();
    
    // In production, this would save to Vercel KV
    // await kv.set(`kv:replay:${replayData.id}:manifest`, replayData);
    // const index = await kv.get('kv:replay:index') || [];
    // index.push(replayData);
    // await kv.set('kv:replay:index', index);
    
    return NextResponse.json({
      success: true,
      id: replayData.id
    });
  } catch (error) {
    console.error('Error creating replay:', error);
    return NextResponse.json(
      { error: 'Failed to create replay' },
      { status: 500 }
    );
  }
}