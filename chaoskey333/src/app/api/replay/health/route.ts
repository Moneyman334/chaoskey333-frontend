import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Basic environment validation
    const environmentChecks = {
      baseUrl: !!baseUrl,
      nodeEnv: !!process.env.NODE_ENV,
      nextPublicClientId: !!process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID,
    };

    // Calculate uptime (approximate)
    const uptime = process.uptime();

    const healthStatus = {
      status: 'healthy',
      timestamp,
      uptime: Math.round(uptime),
      environment: {
        ...environmentChecks,
        allChecksPass: Object.values(environmentChecks).every(Boolean)
      },
      version: '2.0.0-replay',
      service: 'chaoskey333-frontend'
    };

    return NextResponse.json(healthStatus, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      service: 'chaoskey333-frontend'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}