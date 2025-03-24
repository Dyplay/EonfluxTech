import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Check for any of the possible Appwrite session cookies
    const sessionCookies = [
      request.cookies.get('a_session'),
      request.cookies.get('a_session_'),
      request.cookies.get('appwrite_session')
    ];

    const hasSession = sessionCookies.some(cookie => cookie !== undefined);
    
    if (!hasSession) {
      console.log('🔒 Middleware: No session cookie found, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      // Add the return URL as a parameter
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    console.log('✅ Middleware: Session cookie found, proceeding to admin page');
    // Add response headers to prevent caching
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }
  
  return NextResponse.next();
}

// Only run middleware on admin routes
export const config = {
  matcher: ['/admin/:path*']
}; 