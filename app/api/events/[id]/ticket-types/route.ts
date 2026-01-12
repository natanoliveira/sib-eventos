import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { createTicketTypeSchema } from '@/lib/validations';
import { validateBody, validateParams } from '@/lib/validation-middleware';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

// GET /api/events/[id]/ticket-types - Listar tipos de ingresso do evento
async function getTicketTypesHandler(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validation = validateParams(params, paramsSchema);

    if (!validation.success) {
      return validation.error;
    }

    const { id: eventId } = validation.data;

    const ticketTypes = await prisma.ticketType.findMany({
      where: { eventId },
      include: {
        _count: {
          select: { eventMemberships: true },
        },
      },
      orderBy: { price: 'asc' },
    });

    return NextResponse.json(ticketTypes);
  } catch (error) {
    console.error('Error fetching ticket types:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tipos de ingresso' },
      { status: 500 }
    );
  }
}

export const GET = getTicketTypesHandler;

// POST /api/events/[id]/ticket-types - Criar tipo de ingresso
async function createTicketTypeHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paramsValidation = validateParams(params, paramsSchema);

    if (!paramsValidation.success) {
      return paramsValidation.error;
    }

    const { id: eventId } = paramsValidation.data;

    // Verificar se evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { ticketTypes: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    // Validar body
    const bodyValidation = await validateBody(request, createTicketTypeSchema);
    if (!bodyValidation.success) {
      return bodyValidation.error;
    }

    const { name, description, price, capacity } = bodyValidation.data;

    // Validar restrições de capacidade
    if (capacity && event.capacity) {
      const existingCapacity = event.ticketTypes
        .filter((tt) => tt.capacity)
        .reduce((sum, tt) => sum + Number(tt.capacity || 0), 0);

      if (existingCapacity + capacity > event.capacity) {
        return NextResponse.json(
          {
            error:
              'Capacidade total dos tipos de ingresso excede capacidade do evento',
          },
          { status: 400 }
        );
      }
    }

    const ticketType = await prisma.ticketType.create({
      data: {
        name,
        description: description || undefined,
        price,
        capacity: capacity || null,
        eventId,
      },
    });

    return NextResponse.json(ticketType, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket type:', error);
    return NextResponse.json(
      { error: 'Erro ao criar tipo de ingresso' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(createTicketTypeHandler);
