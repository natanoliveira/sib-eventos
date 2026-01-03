import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-utils';
// GET /api/members - Listar membros
export const GET = requirePermission('members.view')(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const category = searchParams.get('category');
      const search = searchParams.get('search');

      const where: any = {};
      if (status) where.status = status;
      if (category) where.category = category;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      const members = await prisma.member.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(members);
    } catch (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar membros' },
        { status: 500 }
      );
    }
  }
);

// POST /api/members - Criar membro
export const POST = requirePermission('members.create')(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { name, email, phone, address, category, status, notes } = body;

      if (!name || !email) {
        return NextResponse.json(
          { error: 'Nome e email são obrigatórios' },
          { status: 400 }
        );
      }

      // Verificar se email já existe
      const existing = await prisma.member.findUnique({
        where: { email },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 409 }
        );
      }

      const member = await prisma.member.create({
        data: {
          name,
          email,
          phone,
          address,
          category,
          status: status || 'ACTIVE',
          notes,
        },
      });

      return NextResponse.json(member, { status: 201 });
    } catch (error) {
      console.error('Error creating member:', error);
      return NextResponse.json(
        { error: 'Erro ao criar membro' },
        { status: 500 }
      );
    }
  }
);
