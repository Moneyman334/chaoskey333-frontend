import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Environment checks
    const environmentChecks = {
      baseUrl: !!baseUrl,
      nodeEnv: !!process.env.NODE_ENV,
      nextPublicClientId: !!process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID,
    };

    // KV Storage checks (if configured)
    const kvChecks = {
      kvRestApiUrl: !!process.env.KV_REST_API_URL,
      kvRestApiToken: !!process.env.KV_REST_API_TOKEN,
    };

    // Provider connectivity checks
    let providerChecks = {
      thirdwebClientConfigured: !!process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID,
    };

    // Test KV connectivity if configured
    let kvConnectivity = null;
    if (kvChecks.kvRestApiUrl && kvChecks.kvRestApiToken) {
      try {
        // Simple ping to KV storage - replace with actual KV test if needed
        kvConnectivity = 'configured_but_not_tested';
      } catch (error) {
        kvConnectivity = 'failed';
      }
    } else {
      kvConnectivity = 'not_configured';
    }

    // Calculate memory usage
    const memoryUsage = process.memoryUsage();
    const memoryInMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    };

    const uptime = process.uptime();

    // Determine overall health
    const criticalChecksPass = environmentChecks.baseUrl && environmentChecks.nodeEnv;
    const overallStatus = criticalChecksPass ? 'healthy' : 'degraded';

    const deepHealthStatus = {
      status: overallStatus,
      timestamp,
      uptime: Math.round(uptime),
      environment: {
        ...environmentChecks,
        allChecksPass: Object.values(environmentChecks).every(Boolean)
      },
      storage: {
        kv: {
          ...kvChecks,
          connectivity: kvConnectivity
        }
      },
      providers: providerChecks,
      system: {
        memory: memoryInMB,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      version: '2.0.0-replay',
      service: 'chaoskey333-frontend',
      checkType: 'deep'
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    return NextResponse.json(deepHealthStatus, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Deep health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      service: 'chaoskey333-frontend',
      checkType: 'deep'
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