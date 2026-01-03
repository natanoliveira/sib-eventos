import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/members/search - Buscar membros por nome, email ou telefone (autocomplete)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length <= 2) {
      return NextResponse.json([]);
    }

    // Buscar membros que correspondam ao critério de busca
    const members = await prisma.member.findMany({
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

    console.log(members);

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error ao buscar membros:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar membros' },
      { status: 500 }
    );
  }
}
