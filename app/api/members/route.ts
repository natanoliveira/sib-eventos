import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { formatMemberCategory, parseMemberCategoryInput } from '@/lib/member-categories';
import { getMembersQuerySchema, createMemberSchema } from '@/lib/validations';
import { validateQuery, validateBody } from '@/lib/validation-middleware';

// GET /api/members - Listar pessoas/membros com paginação
// Protegido com validação Zod
export const GET = requireAuth(
  async (request: NextRequest) => {
    try {
      // Valida query parameters com Zod
      const validation = validateQuery(request, getMembersQuerySchema);

      if (!validation.success) {
        return validation.error;
      }

      const { page, limit, search, category, status } = validation.data;

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
        where.category = parsedCategory.value;
      }

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
// Protegido com validação Zod + sanitização
export const POST = requireAuth(
  async (request: NextRequest) => {
    try {
      // Valida e sanitiza body com Zod
      const validation = await validateBody(request, createMemberSchema);

      if (!validation.success) {
        return validation.error;
      }

      const { name, email, phone, address, category, notes, image } = validation.data;

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
          phone: phone || undefined,
          address: address || undefined,
          ...(parsedCategory.value !== undefined && { category: parsedCategory.value }),
          status: 'ACTIVE',
          notes: notes || undefined,
          image: image || undefined,
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
