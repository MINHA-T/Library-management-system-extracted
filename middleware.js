import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

const PROTECTED_PREFIXES = ['/dashboard', '/books', '/transactions'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  // Not logged in and trying to reach a protected page -> send to login
  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in and visiting /login -> skip straight to dashboard
  if (pathname === '/login' && session) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/books/:path*', '/transactions/:path*'],
};
