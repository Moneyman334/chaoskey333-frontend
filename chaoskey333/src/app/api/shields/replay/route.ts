import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Check health endpoint
    const healthResponse = await fetch(`${baseUrl}/api/replay/health`, {
      cache: 'no-store'
    });
    
    const isHealthy = healthResponse.ok;
    
    // Return Shields.io compatible JSON
    const shieldsResponse = {
      schemaVersion: 1,
      label: "ChaosKey333",
      message: isHealthy ? "online" : "offline",
      color: isHealthy ? "brightgreen" : "red",
      namedLogo: "vercel",
      logoColor: "white"
    };

    return NextResponse.json(shieldsResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Shields endpoint error:', error);
    
    // Return offline status on error
    const errorResponse = {
      schemaVersion: 1,
      label: "ChaosKey333",
      message: "offline",
      color: "red",
      namedLogo: "vercel",
      logoColor: "white"
    };

    return NextResponse.json(errorResponse, {
      status: 200, // Always return 200 for shields.io
      headers: {
        'Cache-Control': 'public, max-age=30', // Shorter cache on error
        'Content-Type': 'application/json'
      }
    });
  }
}