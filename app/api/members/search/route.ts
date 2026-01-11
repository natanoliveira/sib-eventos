import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

// GET /api/members/search - Buscar pessoas/membros por nome, email ou telefone (autocomplete)
async function searchMembersHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Buscar pessoas que correspondam ao critério de busca
    const persons = await prisma.person.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
      },
      take: 10, // Limitar a 10 resultados para autocomplete
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(persons);
  } catch (error) {
    console.error('Error ao buscar membros:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar membros' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(searchMembersHandler);
