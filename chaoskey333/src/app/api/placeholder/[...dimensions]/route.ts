import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { dimensions: string[] } }
) {
  const dimensions = params.dimensions;
  const width = parseInt(dimensions[0]) || 400;
  const height = parseInt(dimensions[1]) || 300;

  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B45FF;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#FF6B9D;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4ECDC4;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="none" stroke="#00FFFF" stroke-width="2" stroke-dasharray="5,5">
        <animateTransform attributeName="transform" type="rotate" values="0 ${width/2} ${height/2};360 ${width/2} ${height/2}" dur="10s" repeatCount="indefinite"/>
      </rect>
      <circle cx="${width/2}" cy="${height/2}" r="30" fill="#FF6B9D" opacity="0.8">
        <animate attributeName="r" values="30;40;30" dur="2s" repeatCount="indefinite"/>
      </circle>
      <text x="${width/2}" y="${height/2 + 5}" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="bold">
        CHAOS RELIC
      </text>
      <text x="${width/2}" y="${height/2 + 25}" font-family="Arial, sans-serif" font-size="10" fill="#00FFFF" text-anchor="middle">
        ${width}x${height}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}