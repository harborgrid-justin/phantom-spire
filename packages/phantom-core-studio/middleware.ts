/**
 * Next.js Middleware
 * Addresses Control N.22: Missing Middleware Route Handling
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route patterns that require validation
const DYNAMIC_ROUTES = [
  '/projects/[projectId]',
  '/users/[id]',
  '/blog/[[...slug]]',
  '/docs/[...slug]',
  '/projects/[projectId]/models/[modelId]'
];

// Routes that should use replace navigation
const REPLACE_ROUTES = [
  '/success',
  '/confirmation',
  '/redirect',
  '/auth/callback'
];

// Routes that should disable prefetch
const NO_PREFETCH_ROUTES = [
  '/admin',
  '/settings',
  '/compliance',
  '/heavy'
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const fullUrl = pathname + search;

  // Add route metadata headers for client-side optimization
  const response = NextResponse.next();

  // Check if route should use replace navigation
  const shouldReplace = REPLACE_ROUTES.some(route => pathname.startsWith(route));
  if (shouldReplace) {
    response.headers.set('X-Replace-Navigation', 'true');
  }

  // Check if route should disable prefetch
  const shouldDisablePrefetch = NO_PREFETCH_ROUTES.some(route => pathname.startsWith(route));
  if (shouldDisablePrefetch) {
    response.headers.set('X-Disable-Prefetch', 'true');
  }

  // Validate dynamic route parameters
  if (pathname.includes('[') && pathname.includes(']')) {
    // This would be a malformed URL in production
    if (pathname.includes('[') || pathname.includes(']')) {
      return NextResponse.redirect(new URL('/not-found', request.url));
    }
  }

  // Add security headers for navigation
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Add route timing header for monitoring
  response.headers.set('X-Route-Timestamp', Date.now().toString());

  return response;
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};