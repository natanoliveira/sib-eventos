import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { AUTH_TOKEN_TTL_SECONDS, generateToken } from '@/lib/auth';
import { DEFAULT_PERMISSIONS_BY_ROLE } from '@/lib/permissions';
import { errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { withRateLimit, loginLimiter } from '@/lib/rate-limit';

async function loginHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user || !user.password) {
      logger.warn('Tentativa de login com credenciais inválidas', { email });
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn('Tentativa de login com senha incorreta', { email });
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    let permissions = user.userPermissions.map((up) => up.permission.code);

    if (permissions.length === 0) {
      const defaultPermissions =
        DEFAULT_PERMISSIONS_BY_ROLE[user.role as keyof typeof DEFAULT_PERMISSIONS_BY_ROLE] || [];

      if (defaultPermissions.length > 0) {
        const permissionRecords = await prisma.permission.findMany({
          where: { code: { in: defaultPermissions } },
        });

        if (permissionRecords.length > 0) {
          await prisma.userPermission.createMany({
            data: permissionRecords.map((perm) => ({
              userId: user.id,
              permissionId: perm.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      const refreshed = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          userPermissions: {
            include: { permission: true },
          },
        },
      });

      permissions = refreshed?.userPermissions.map((up) => up.permission.code) || [];
    }

    const token = generateToken(user.id);

    logger.info('Login realizado com sucesso', { userId: user.id, email });

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        permissions,
      },
    });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: AUTH_TOKEN_TTL_SECONDS,
    });

    return response;
  } catch (error) {
    return errorResponse('Erro ao fazer login', 500, error);
  }
}

// Aplicar rate limiting: 5 tentativas a cada 15 minutos
export const POST = withRateLimit(loginLimiter, loginHandler);
