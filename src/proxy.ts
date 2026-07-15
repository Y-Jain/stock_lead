import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtToken } from './lib/auth';

// Add paths that don't require authentication
const publicPaths = ['/login', '/forgot-password', '/api/auth/login', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/public'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path)) || pathname.startsWith('/form/')) {
    return NextResponse.next();
  }

  // 2. Check for token
  const token = request.cookies.get('crm_session')?.value;
  
  if (!token) {
    return handleUnauthorized(request);
  }

  // 3. Verify Token
  const payload = await verifyJwtToken(token);
  if (!payload) {
    return handleUnauthorized(request);
  }

  const role = payload.role as string;

  // Superadmin only routes
  if (pathname.startsWith('/admins') || pathname.startsWith('/settings')) {
    if (role !== 'superadmin') {
      return NextResponse.redirect(new URL('/managers', request.url));
    }
  }

  // Admin and Superadmin routes
  if (pathname.startsWith('/managers') || pathname.startsWith('/forms')) {
    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/leads', request.url));
    }
  }

  // Manager only routes
  if (pathname.startsWith('/leads')) {
    if (role !== 'manager') {
      return NextResponse.redirect(new URL('/managers', request.url));
    }
  }

  // Next.js API Routes protection
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    // Basic protection: if we reach here, they have a valid token
    // We could add more granular API RBAC here or in the route handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id as string);
    requestHeaders.set('x-user-role', payload.role as string);
    if (payload.manager_id) {
      requestHeaders.set('x-manager-id', payload.manager_id as string);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

function handleUnauthorized(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/login', request.url));
}

// Specify which routes this middleware should run on
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
