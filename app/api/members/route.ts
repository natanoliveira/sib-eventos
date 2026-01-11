import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { formatMemberCategory, parseMemberCategoryInput } from '@/lib/member-categories';

// GET /api/members - Listar pessoas/membros com paginação
export const GET = requireAuth(
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
      const parsedCategory = parseMemberCategoryInput(category);
      if (!parsedCategory.isValid) {
        return NextResponse.json(
          { error: 'Categoria inválida' },
          { status: 400 }
        );
      }
      if (parsedCategory.value !== undefined && parsedCategory.value !== null) {
        where.category = category;
      }

      console.log();
      console.log(where);
      console.log();
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

      const formattedPersons = persons.map((person) => ({
        ...person,
        category: formatMemberCategory(person.category),
      }));

      return NextResponse.json({
        data: formattedPersons,
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
export const POST = requireAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { name, email, phone, address, category, status, notes, image } = body;

      if (!name || !email) {
        return NextResponse.json(
          { error: 'Nome e e-mail são obrigatórios' },
          { status: 400 }
        );
      }

      // Verificar se email já existe
      const existing = await prisma.person.findUnique({
        where: { email },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'E-mail já cadastrado' },
          { status: 409 }
        );
      }

      const parsedCategory = parseMemberCategoryInput(category);
      if (!parsedCategory.isValid) {
        return NextResponse.json(
          { error: 'Categoria inválida' },
          { status: 400 }
        );
      }

      const person = await prisma.person.create({
        data: {
          name,
          email,
          phone,
          address,
          ...(parsedCategory.value !== undefined && { category: parsedCategory.value }),
          status: status || 'ACTIVE',
          notes,
          image,
        },
      });

      return NextResponse.json(
        { ...person, category: formatMemberCategory(person.category) },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating person:', error);
      return NextResponse.json(
        { error: 'Erro ao criar pessoa' },
        { status: 500 }
      );
    }
  }
);
