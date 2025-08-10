import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Get environment variables
  const environment = process.env.NEXT_PUBLIC_ENV || 'production';
  const previewPassword = process.env.PREVIEW_PASSWORD || 'Chaos333';
  const ipAllowlist = process.env.IP_ALLOWLIST?.split(',').map(ip => ip.trim()) || [];

  // Add no-index headers for preview and vault-test environments
  if (environment === 'preview' || environment === 'vault-test') {
    response.headers.set('x-robots-tag', 'noindex, nofollow');
  }

  // IP allowlist check for vault-test environment
  if (environment === 'vault-test' && ipAllowlist.length > 0) {
    const clientIP = getClientIP(request);
    if (!ipAllowlist.includes(clientIP)) {
      return new NextResponse('Access denied', { status: 403 });
    }
  }

  // Password protection for preview environments
  if (environment === 'preview') {
    // Skip protection for preview auth page and API
    if (pathname === '/preview' || pathname === '/api/preview-auth') {
      return response;
    }

    // Check if user has valid preview session
    const previewSession = request.cookies.get('preview-session');
    if (!previewSession?.value || previewSession.value !== 'authenticated') {
      // Redirect to preview gate page
      const previewUrl = new URL('/preview', request.url);
      previewUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(previewUrl);
    }
  }

  return response;
}

function getClientIP(request: NextRequest): string {
  // Check various headers for the real client IP
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const xClientIP = request.headers.get('x-client-ip');
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (xRealIP) {
    return xRealIP;
  }
  
  if (xClientIP) {
    return xClientIP;
  }
  
  // Fallback to connection remote address
  return request.ip || '127.0.0.1';
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};