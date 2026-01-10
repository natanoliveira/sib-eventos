import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-utils';

// GET /api/members - Listar pessoas/membros com paginação
export const GET = requirePermission('members.view')(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const category = searchParams.get('category');
      const search = searchParams.get('search');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');

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

      // Contar total de registros
      const total = await prisma.person.count({ where });

      // Buscar dados paginados
      const persons = await prisma.person.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        data: persons,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.error('Error fetching persons:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar pessoas' },
        { status: 500 }
      );
    }
  }
);

// POST /api/members - Criar pessoa/membro
export const POST = requirePermission('members.create')(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { name, email, phone, address, category, status, notes, image } = body;

      if (!name || !email) {
        return NextResponse.json(
          { error: 'Nome e email são obrigatórios' },
          { status: 400 }
        );
      }

      // Verificar se email já existe
      const existing = await prisma.person.findUnique({
        where: { email },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 409 }
        );
      }

      const person = await prisma.person.create({
        data: {
          name,
          email,
          phone,
          address,
          category,
          status: status || 'ACTIVE',
          notes,
          image,
        },
      });

      return NextResponse.json(person, { status: 201 });
    } catch (error) {
      console.error('Error creating person:', error);
      return NextResponse.json(
        { error: 'Erro ao criar pessoa' },
        { status: 500 }
      );
    }
  }
);
