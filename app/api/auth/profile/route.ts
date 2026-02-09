import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { DEFAULT_PERMISSIONS_BY_ROLE } from '@/lib/permissions';

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  image: true,
  role: true,
  status: true,
  joinDate: true,
  createdAt: true,
  updatedAt: true,
  userPermissions: {
    include: {
      permission: true,
    },
  },
};

// GET /api/auth/profile - Perfil do usuario autenticado
export const GET = requireAuth(
  async (_request: NextRequest, context: { user: { id: string } }) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: context.user.id },
        select: PROFILE_SELECT,
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }

      let permissions = user.userPermissions?.map((up) => up.permission.code) || [];

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
          select: PROFILE_SELECT,
        });

        permissions = refreshed?.userPermissions?.map((up) => up.permission.code) || [];

        if (refreshed) {
          const { userPermissions, ...rest } = refreshed;
          return NextResponse.json({ ...rest, permissions });
        }
      }

      const { userPermissions, ...rest } = user;
      return NextResponse.json({ ...rest, permissions });
    } catch (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar perfil' },
        { status: 500 }
      );
    }
  }
);

// PUT /api/auth/profile - Atualizar perfil do usuario autenticado
export const PUT = requireAuth(
  async (request: NextRequest, context: { user: { id: string } }) => {
    try {
      const contentType = request.headers.get('content-type') || '';
      let name: string | undefined;
      let email: string | undefined;
      let phone: string | undefined;
      let address: string | undefined;
      let image: string | undefined;

      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const file = formData.get('image');

        if (file && file instanceof File) {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
              { error: 'Tipo de imagem não permitido' },
              { status: 400 }
            );
          }

          if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
              { error: 'A imagem deve ter no máximo 5MB' },
              { status: 400 }
            );
          }

          const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
          await fs.mkdir(uploadsDir, { recursive: true });

          const extension = file.type.split('/')[1] || 'png';
          const filename = `${context.user.id}-${Date.now()}.${extension}`;
          const filePath = path.join(uploadsDir, filename);

          const buffer = Buffer.from(await file.arrayBuffer());
          await fs.writeFile(filePath, buffer);

          image = `/uploads/avatars/${filename}`;
        }
      } else {
        const body = await request.json();
        ({ name, email, phone, address, image } = body ?? {});
      }

      if (email !== undefined && typeof email !== 'string') {
        return NextResponse.json(
          { error: 'E-mail inválido' },
          { status: 400 }
        );
      }

      if (email) {
        const existing = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });

        if (existing && existing.id !== context.user.id) {
          return NextResponse.json(
            { error: 'E-mail já cadastrado' },
            { status: 409 }
          );
        }
      }

      const updateData: Record<string, string> = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (image !== undefined) updateData.image = image;

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: 'Nenhum dado para atualizar' },
          { status: 400 }
        );
      }

      const user = await prisma.user.update({
        where: { id: context.user.id },
        data: updateData,
        select: PROFILE_SELECT,
      });

      const permissions = user.userPermissions?.map((up) => up.permission.code) || [];
      const { userPermissions, ...rest } = user;
      return NextResponse.json({ ...rest, permissions });
    } catch (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar perfil' },
        { status: 500 }
      );
    }
  }
);
