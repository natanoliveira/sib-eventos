import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { hash } from 'bcryptjs';

// GET /api/users - Listar usuários
export const GET = requireAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const role = searchParams.get('role');
      const status = searchParams.get('status');
      const search = searchParams.get('search');

      const where: any = {};
      if (role) where.role = role;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        include: {
          userPermissions: {
            include: {
              permission: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform permissions to match frontend structure
      const usersWithPermissions = users.map(user => ({
        ...user,
        permissions: user.userPermissions.reduce((acc, up) => {
          acc[up.permission.code] = true;
          return acc;
        }, {} as Record<string, boolean>)
      }));

      return NextResponse.json(usersWithPermissions);
    } catch (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar usuários' },
        { status: 500 }
      );
    }
  }
);

// POST /api/users - Criar usuário
export const POST = requireAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { name, email, password, role, permissions } = body;

      if (!name || !email || !password) {
        return NextResponse.json(
          { error: 'Nome, email e senha são obrigatórios' },
          { status: 400 }
        );
      }

      // Verificar se email já existe
      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 409 }
        );
      }

      // Hash da senha
      const hashedPassword = await hash(password, 10);

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'MEMBER',
          status: 'ACTIVE',
        },
      });

      // Criar permissões se fornecidas
      if (permissions && typeof permissions === 'object') {
        const permissionCodes = Object.keys(permissions).filter(code => permissions[code]);

        if (permissionCodes.length > 0) {
          // Buscar IDs das permissões
          const permissionRecords = await prisma.permission.findMany({
            where: {
              code: { in: permissionCodes }
            }
          });

          // Criar UserPermissions
          await prisma.userPermission.createMany({
            data: permissionRecords.map(perm => ({
              userId: user.id,
              permissionId: perm.id
            }))
          });
        }
      }

      // Buscar usuário criado com permissões
      const createdUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          userPermissions: {
            include: {
              permission: true
            }
          }
        }
      });

      return NextResponse.json(createdUser, { status: 201 });
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }
  }
);
