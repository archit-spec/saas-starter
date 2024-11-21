import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that require authentication
const protectedPaths = ['/dashboard', '/profile', '/payment'];

// List of public paths that should redirect to dashboard if user is authenticated
const publicPaths = ['/', '/login', '/signup'];

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth_token');
  const path = request.nextUrl.pathname;

  // Check if the path is protected
  if (protectedPaths.some(pp => path.startsWith(pp))) {
    if (!authCookie) {
      // Redirect to login if no auth cookie is present
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check if the path is public and user is authenticated
  if (publicPaths.includes(path) && authCookie) {
    // Redirect to dashboard if user is already authenticated
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
