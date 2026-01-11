import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { errorResponse } from '@/lib/api-response';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';
import { getEventsQuerySchema, createEventSchema } from '@/lib/validations';
import { validateQuery, validateBody } from '@/lib/validation-middleware';

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
    // Valida query parameters com Zod
    const validation = validateQuery(request, getEventsQuerySchema);

    if (!validation.success) {
      return validation.error;
    }

    const { search, category, status } = validation.data;
    const page = validation.data.page ?? 1;
    const limit = validation.data.limit ?? 10;

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
// Protegido com validação Zod + sanitização
export const POST = requireAuth(
  async (request: NextRequest, context: any) => {
    try {
      // Valida e sanitiza body com Zod
      const validation = await validateBody(request, createEventSchema);

      if (!validation.success) {
        return validation.error;
      }

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
        status,
      } = validation.data;

      const event = await prisma.event.create({
        data: {
          title,
          description: description || undefined,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          location,
          capacity,
          price: price ?? 0,
          category: category || 'Geral',
          imageUrl: imageUrl || undefined,
          creatorId: context.user.id,
          status: status || 'ACTIVE',
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
