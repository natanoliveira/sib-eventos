import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-utils';

// GET /api/members/[id] - Obter membro específico
export const GET = requirePermission('members.view')(
  async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const member = await prisma.member.findUnique({
        where: { id },
      });

      if (!member) {
        return NextResponse.json(
          { error: 'Membro não encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(member);
    } catch (error) {
      console.error('Error fetching member:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar membro' },
        { status: 500 }
      );
    }
  }
);

// PUT /api/members/[id] - Atualizar membro
export const PUT = requirePermission('members.edit')(
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
      } = body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (category !== undefined) updateData.category = category;
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      const member = await prisma.member.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json(member);
    } catch (error) {
      console.error('Error updating member:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar membro' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/members/[id] - Deletar membro
export const DELETE = requirePermission('members.delete')(
  async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      await prisma.member.delete({
        where: { id },
      });

      return NextResponse.json({ message: 'Membro deletado com sucesso' });
    } catch (error) {
      console.error('Error deleting member:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar membro' },
        { status: 500 }
      );
    }
  }
);
