import { NextResponse } from 'next/server';

// Mock manifest data for specific replays
const mockManifests = {
  'PR-18': {
    id: 'PR-18',
    pr: 18,
    title: 'Cosmic Authentication Flow',
    duration: 180,
    media_urls: {
      video: 'https://example.com/replay/PR-18/video.mp4',
      audio: 'https://example.com/replay/PR-18/audio.mp3',
      thumbnail: 'https://example.com/replay/PR-18/thumb.jpg'
    },
    glyph_times: [
      { time: 30, symbol: '⚡', text: 'Cosmic activation sequence', x: 50, y: 30 },
      { time: 60, symbol: '🔮', text: 'Reality anchor established', x: 70, y: 50 },
      { time: 90, symbol: '∞', text: 'Infinite loop detected', x: 30, y: 70 },
      { time: 120, symbol: '🌀', text: 'Dimensional breach opening', x: 80, y: 20 }
    ],
    captions: {
      en: [
        { start: 0, end: 30, text: 'Initializing cosmic authentication protocol...' },
        { start: 30, end: 60, text: 'Reality anchor established. Beginning sequence.' },
        { start: 60, end: 90, text: 'Infinite loop detected in dimensional matrix.' },
        { start: 90, end: 120, text: 'Breach opening. Proceed with caution.' },
        { start: 120, end: 180, text: 'Authentication complete. Access granted.' }
      ],
      es: [
        { start: 0, end: 30, text: 'Inicializando protocolo de autenticación cósmica...' },
        { start: 30, end: 60, text: 'Ancla de realidad establecida. Comenzando secuencia.' },
        { start: 60, end: 90, text: 'Bucle infinito detectado en matriz dimensional.' },
        { start: 90, end: 120, text: 'Brecha abriéndose. Proceder con precaución.' },
        { start: 120, end: 180, text: 'Autenticación completa. Acceso concedido.' }
      ]
    },
    tags: ['auth', 'cosmic', 'golden'],
    locales: ['en', 'es'],
    status: 'ARCHIVED',
    created_at: '2024-01-15T10:00:00Z',
    featured: true,
    canonical: true
  },
  'PR-23': {
    id: 'PR-23',
    pr: 23,
    title: 'Spectral Decode Implementation',
    duration: 240,
    media_urls: {
      video: 'https://example.com/replay/PR-23/video.mp4',
      audio: 'https://example.com/replay/PR-23/audio.mp3',
      thumbnail: 'https://example.com/replay/PR-23/thumb.jpg'
    },
    glyph_times: [
      { time: 45, symbol: '👁', text: 'Spectral vision activated', x: 60, y: 40 },
      { time: 90, symbol: '🌊', text: 'Wave function collapse', x: 40, y: 60 },
      { time: 135, symbol: '🔓', text: 'Decode sequence unlocked', x: 75, y: 25 },
      { time: 180, symbol: '✨', text: 'Pattern recognition complete', x: 35, y: 75 }
    ],
    captions: {
      en: [
        { start: 0, end: 45, text: 'Implementing spectral decode framework...' },
        { start: 45, end: 90, text: 'Spectral vision layer activated successfully.' },
        { start: 90, end: 135, text: 'Wave function collapse detected. Adjusting parameters.' },
        { start: 135, end: 180, text: 'Decode sequence unlocked. Analyzing patterns.' },
        { start: 180, end: 240, text: 'Implementation complete. System operational.' }
      ]
    },
    tags: ['spectral', 'decode', 'glyph'],
    locales: ['en'],
    status: 'LIVE',
    created_at: '2024-01-20T14:30:00Z',
    featured: false,
    canonical: false
  },
  'PR-24': {
    id: 'PR-24',
    pr: 24,
    title: 'Glyph Overlay System',
    duration: 320,
    media_urls: {
      video: 'https://example.com/replay/PR-24/video.mp4',
      audio: 'https://example.com/replay/PR-24/audio.mp3',
      thumbnail: 'https://example.com/replay/PR-24/thumb.jpg'
    },
    glyph_times: [
      { time: 60, symbol: '📐', text: 'Geometric alignment initiated', x: 50, y: 50 },
      { time: 120, symbol: '🎭', text: 'Overlay mask applied', x: 65, y: 35 },
      { time: 180, symbol: '🔮', text: 'Reality distortion detected', x: 45, y: 65 },
      { time: 240, symbol: '⚖️', text: 'System balance restored', x: 80, y: 40 }
    ],
    captions: {
      en: [
        { start: 0, end: 60, text: 'Building glyph overlay system architecture...' },
        { start: 60, end: 120, text: 'Geometric alignment protocols engaged.' },
        { start: 120, end: 180, text: 'Overlay mask successfully applied to interface.' },
        { start: 180, end: 240, text: 'Reality distortion compensated. Stabilizing...' },
        { start: 240, end: 320, text: 'Glyph overlay system fully operational.' }
      ],
      fr: [
        { start: 0, end: 60, text: 'Construction de l\'architecture du système de superposition...' },
        { start: 60, end: 120, text: 'Protocoles d\'alignement géométrique engagés.' },
        { start: 120, end: 180, text: 'Masque de superposition appliqué avec succès.' },
        { start: 180, end: 240, text: 'Distorsion réalité compensée. Stabilisation...' },
        { start: 240, end: 320, text: 'Système de superposition pleinement opérationnel.' }
      ]
    },
    tags: ['glyph', 'overlay', 'ui'],
    locales: ['en', 'fr'],
    status: 'MUTATING',
    created_at: '2024-01-22T09:15:00Z',
    featured: false,
    canonical: false
  }
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const replayId = params.id;
    
    // In production, this would fetch from Vercel KV
    // const manifest = await kv.get(`kv:replay:${replayId}:manifest`);
    
    const manifest = mockManifests[replayId as keyof typeof mockManifests];
    
    if (!manifest) {
      return NextResponse.json(
        { error: 'Replay manifest not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...manifest,
      cached: true
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    console.error('Error fetching replay manifest:', error);
    return NextResponse.json(
      { error: 'Failed to fetch replay manifest' },
      { status: 500 }
    );
  }
}