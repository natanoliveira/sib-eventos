import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
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

    // Criar mapa de permissions para facilitar verificação no frontend
    const permissions: Record<string, boolean> = {};
    user.userPermissions.forEach((up) => {
      permissions[up.permission.code] = true;
    });

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
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return errorResponse('Erro ao fazer login', 500, error);
  }
}

// Aplicar rate limiting: 5 tentativas a cada 15 minutos
export const POST = withRateLimit(loginLimiter, loginHandler);
