import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-utils';
import { errorResponse } from '@/lib/api-response';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';

/**
 * GET /api/events - Listar eventos
 *
 * ROTA PÚBLICA: Esta rota é intencionalmente pública para permitir
 * visualização de eventos e inscrições online por usuários não autenticados.
 *
 * Proteções implementadas:
 * - Rate limiting: 60 requests/minuto
 * - Filtra apenas eventos não removidos
 * - Não expõe informações sensíveis (passwords, etc.)
 */
async function getEventsHandler(request: NextRequest) {
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
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const events = await prisma.event.findMany({
      where: {
        removed: false,
        ...where,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            // Não expor email do criador publicamente
          },
        },
        _count: {
          select: {
            memberships: true,
            tickets: true,
            // Não expor contagem de invoices publicamente
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    return errorResponse('Erro ao buscar eventos', 500, error);
  }
}

// Aplicar rate limiting para proteção contra abuse
export const GET = withRateLimit(apiLimiter, getEventsHandler);

// POST /api/events - Criar evento
export const POST = requirePermission('events.create')(
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
