import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-utils';

// GET /api/users/[id] - Buscar usuário por ID
export const GET = requirePermission('users.view')(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
          userPermissions: {
            include: {
              permission: true
            }
          }
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }

      // Transform permissions to match frontend structure
      const userWithPermissions = {
        ...user,
        permissions: user.userPermissions.reduce((acc, up) => {
          acc[up.permission.code] = true;
          return acc;
        }, {} as Record<string, boolean>)
      };

      return NextResponse.json(userWithPermissions);
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar usuário' },
        { status: 500 }
      );
    }
  }
);

// PUT /api/users/[id] - Atualizar usuário
export const PUT = requirePermission('users.edit')(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await request.json();
      const { name, email, role, status, permissions } = body;

      // Verificar se usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id: params.id }
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }

      // Se email foi alterado, verificar se novo email já existe
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        });

        if (emailExists) {
          return NextResponse.json(
            { error: 'Email já cadastrado' },
            { status: 409 }
          );
        }
      }

      // Atualizar usuário
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (status !== undefined) updateData.status = status;

      const user = await prisma.user.update({
        where: { id: params.id },
        data: updateData,
      });

      // Atualizar permissões se fornecidas
      if (permissions && typeof permissions === 'object') {
        // Remover permissões existentes
        await prisma.userPermission.deleteMany({
          where: { userId: params.id }
        });

        // Adicionar novas permissões
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

      // Buscar usuário atualizado com permissões
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          userPermissions: {
            include: {
              permission: true
            }
          }
        }
      });

      return NextResponse.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar usuário' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/users/[id] - Deletar usuário
export const DELETE = requirePermission('users.delete')(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      // Verificar se usuário existe
      const user = await prisma.user.findUnique({
        where: { id: params.id }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }

      // Soft delete - apenas marcar como inativo
      await prisma.user.update({
        where: { id: params.id },
        data: { status: 'INACTIVE' }
      });

      return NextResponse.json({
        message: 'Usuário removido com sucesso'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar usuário' },
        { status: 500 }
      );
    }
  }
);
