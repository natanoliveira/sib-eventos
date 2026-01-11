import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { errorResponse } from '@/lib/api-response';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';

/**
 * GET /api/events - Listar eventos com paginação
 *
 * Proteções implementadas:
 * - Rate limiting: 60 requests/minuto
 * - Filtra apenas eventos não removidos
 * - Não expõe informações sensíveis (passwords, etc.)
 * - Paginação server-side
 */
async function getEventsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = { removed: false };
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Contar total de registros
    const total = await prisma.event.count({ where });

    // Buscar dados paginados
    const events = await prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            memberships: true,
            tickets: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: events,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    return errorResponse('Erro ao buscar eventos', 500, error);
  }
}

// Aplicar rate limiting para proteção contra abuse
export const GET = requireAuth(withRateLimit(apiLimiter, getEventsHandler));

// POST /api/events - Criar evento
export const POST = requireAuth(
  async (request: NextRequest, context: any) => {
    try {
      const body = await request.json();
      const {
        title,
        description,
        startDate,
        endDate,
        location,
        capacity,
        price,
        category,
        imageUrl,
      } = body;

      if (!title || !startDate || !location || capacity === undefined || price === undefined) {
        return NextResponse.json(
          { error: 'Dados incompletos' },
          { status: 400 }
        );
      }

      const event = await prisma.event.create({
        data: {
          title,
          description,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          location,
          capacity: parseInt(capacity),
          price: parseFloat(price),
          category: category || 'Geral',
          imageUrl,
          creatorId: context.user.id,
          status: 'ACTIVE',
          removed: false,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json(event, { status: 201 });
    } catch (error) {
      console.error('Error creating event:', error);
      return NextResponse.json(
        { error: 'Erro ao criar evento' },
        { status: 500 }
      );
    }
  }
);
