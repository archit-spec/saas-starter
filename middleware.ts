import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that require authentication
const protectedPaths = ['/dashboard', '/profile', '/payment'];

// List of public paths that should redirect to dashboard if user is authenticated
const publicPaths = ['/', '/login', '/signup'];

// Paths that should be ignored by the middleware
const ignoredPaths = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/static',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore certain paths
  if (ignoredPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get the auth token from cookies
  const authToken = request.cookies.get('auth_token');

  // Handle protected routes
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!authToken) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Handle public routes when user is authenticated
  if (publicPaths.includes(pathname) && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and API routes
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
