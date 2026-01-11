import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { formatMemberCategory, parseMemberCategoryInput } from '@/lib/member-categories';
import { updateMemberSchema, deleteMemberSchema } from '@/lib/validations';
import { validateBody, validateParams } from '@/lib/validation-middleware';

// GET /api/members/[id] - Obter pessoa/membro específico
export const GET = requireAuth(
  async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const resolvedParams = await params;

      // Valida route params
      const validation = validateParams(resolvedParams, deleteMemberSchema);

      if (!validation.success) {
        return validation.error;
      }

      const { id } = validation.data;

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
// Protegido com validação Zod + sanitização
export const PUT = requireAuth(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const resolvedParams = await params;

      // Valida route params
      const paramsValidation = validateParams(resolvedParams, deleteMemberSchema);

      if (!paramsValidation.success) {
        return paramsValidation.error;
      }

      const { id } = paramsValidation.data;

      // Valida e sanitiza body com Zod
      const validation = await validateBody(request, updateMemberSchema);

      if (!validation.success) {
        return validation.error;
      }

      const {
        name,
        email,
        phone,
        address,
        category,
        status,
        notes,
        image,
      } = validation.data;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;

      if (category !== undefined) {
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
      }

      if (status !== undefined) updateData.status = status;
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
      const resolvedParams = await params;

      // Valida route params
      const validation = validateParams(resolvedParams, deleteMemberSchema);

      if (!validation.success) {
        return validation.error;
      }

      const { id } = validation.data;

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
