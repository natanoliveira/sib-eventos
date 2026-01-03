import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Permitir acesso público às rotas de autenticação e assets
  const publicPaths = [
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/api/events', // Public access to list events
    '/api/members/search', // Public search for event registration
    '/inscricoes', // Public event registration page
    '/login', // Login page
    '/', // Home page
  ];

  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Para outras rotas, a autenticação será verificada nas próprias APIs
  return NextResponse.next();
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
