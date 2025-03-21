import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Check if user has a session cookie
    const sessionCookie = request.cookies.get('appwrite-session');
    
    if (!sessionCookie) {
      console.log('No session cookie, redirecting from admin page');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Continue to client-side auth checks if there's a session
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
}; 