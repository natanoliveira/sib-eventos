import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { validateEmail, validatePasswordStrength } from '@/lib/utils';
import { errorResponse, validationErrorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { withRateLimit, registerLimiter } from '@/lib/rate-limit';

async function registerHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address, category } = body;

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      logger.warn('Tentativa de registro com email inválido', { email, errors: emailValidation.errors });
      return validationErrorResponse({
        email: emailValidation.errors.join(', '),
      });
    }

    // Validar força da senha
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      logger.warn('Tentativa de registro com senha fraca', { email });
      return validationErrorResponse({
        password: passwordValidation.errors.join(', '),
      });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      logger.warn('Tentativa de registro com email já cadastrado', { email });
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    // Hash da senha com bcrypt (12 rounds para segurança)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone,
        address,
        category,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });

    const token = generateToken(user.id);

    logger.info('Novo usuário registrado', { userId: user.id, email: user.email });

    const response = NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        },
        passwordStrength: passwordValidation.strength,
      },
      { status: 201 }
    );
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return errorResponse('Erro ao criar conta', 500, error);
  }
}

// Aplicar rate limiting: 3 registros por hora
export const POST = withRateLimit(registerLimiter, registerHandler);
