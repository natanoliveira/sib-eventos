import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { formatMemberCategory, parseMemberCategoryInput } from '@/lib/member-categories';

// GET /api/members/[id] - Obter pessoa/membro específico
export const GET = requireAuth(
  async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const person = await prisma.person.findUnique({
        where: { id },
      });

      if (!person) {
        return NextResponse.json(
          { error: 'Pessoa não encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ...person,
        category: formatMemberCategory(person.category),
      });
    } catch (error) {
      console.error('Error fetching person:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar pessoa' },
        { status: 500 }
      );
    }
  }
);

// PUT /api/members/[id] - Atualizar pessoa/membro
export const PUT = requireAuth(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const {
        name,
        email,
        phone,
        address,
        category,
        status,
        notes,
        image,
      } = body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      const parsedCategory = parseMemberCategoryInput(category);
      if (!parsedCategory.isValid) {
        return NextResponse.json(
          { error: 'Categoria inválida' },
          { status: 400 }
        );
      }
      if (parsedCategory.value !== undefined) {
        updateData.category = parsedCategory.value;
      }
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (image !== undefined) updateData.image = image;

      const person = await prisma.person.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        ...person,
        category: formatMemberCategory(person.category),
      });
    } catch (error) {
      console.error('Error updating person:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar pessoa' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/members/[id] - Deletar pessoa/membro
export const DELETE = requireAuth(
  async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      await prisma.person.delete({
        where: { id },
      });

      return NextResponse.json({ message: 'Pessoa deletada com sucesso' });
    } catch (error) {
      console.error('Error deleting person:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar pessoa' },
        { status: 500 }
      );
    }
  }
);
