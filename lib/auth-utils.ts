import { NextRequest } from 'next/server';
import { verifyToken } from './auth';
import { prisma } from './prisma';

export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('auth_token')?.value;

  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : cookieToken;

  if (!token) {
    return null;
  }
  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  return user;
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const user = await getUserFromRequest(request);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler(request, { ...context, user });
  };
}

export function requireRole(roles: string[]) {
  return (handler: Function) => {
    return async (request: NextRequest, context?: any) => {
      const user = await getUserFromRequest(request);

      if (!user) {
        return new Response(JSON.stringify({ error: 'Não autenticado' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!roles.includes(user.role)) {
        return new Response(JSON.stringify({ error: 'Sem permissão' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return handler(request, { ...context, user });
    };
  };
}

export function requirePermission(permissionCode: string) {
  return (handler: Function) => {
    return async (request: NextRequest, context?: any) => {
      const user = await getUserFromRequest(request);

      if (!user) {
        return new Response(JSON.stringify({ error: 'Não autenticado' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Admin has all permissions
      if (user.role === 'ADMIN') {
        return handler(request, { ...context, user });
      }

      // Check if user has the required permission
      const hasPermission = user.userPermissions?.some(
        (up) => up.permission.code === permissionCode
      );

      if (!hasPermission) {
        return new Response(JSON.stringify({ error: 'Sem permissão' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return handler(request, { ...context, user });
    };
  };
}
