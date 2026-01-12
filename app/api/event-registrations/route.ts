import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { errorResponse } from '@/lib/api-response';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';
import { getRegistrationsQuerySchema, createRegistrationSchema } from '@/lib/validations';
import { validateQuery, validateBody } from '@/lib/validation-middleware';

/**
 * GET /api/event-registrations - Listar inscrições em eventos com paginação
 *
 * Query params:
 * - eventId: Filtrar por evento específico
 * - userId: Filtrar por usuário/pessoa específica (personId)
 * - status: Filtrar por status (PENDING, CONFIRMED, CANCELLED)
 * - page: Número da página (padrão: 1)
 * - limit: Itens por página (padrão: 10)
 */
async function getRegistrationsHandler(request: NextRequest) {
  try {
    // Valida query parameters com Zod
    const validation = validateQuery(request, getRegistrationsQuerySchema);

    if (!validation.success) {
      return validation.error;
    }

    const { eventId, personId, status } = validation.data;
    const page = validation.data.page ?? 1;
    const limit = validation.data.limit ?? 10;

    const where: any = {};
    if (eventId) where.eventId = eventId;
    if (personId) where.personId = personId;
    if (status) where.status = status;

    // Contar total de registros
    const total = await prisma.eventMembership.count({ where });

    // Buscar dados paginados
    const registrations = await prisma.eventMembership.findMany({
      where,
      include: {
        person: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            location: true,
            price: true,
            status: true,
          },
        },
        ticketType: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      relationLoadStrategy: 'join',
      orderBy: {
        registeredAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    // Formatar resposta para compatibilidade com o frontend
    const formattedRegistrations = registrations.map((reg) => ({
      id: reg.id,
      userId: reg.userId,
      eventId: reg.eventId,
      ticketTypeId: reg.ticketTypeId,
      status: reg.status,
      registeredAt: reg.registeredAt,
      person: reg.person,
      event: reg.event,
      ticketType: reg.ticketType,
      createdBy: reg.createdByUser,
    }));

    return NextResponse.json({
      data: formattedRegistrations,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    return errorResponse('Erro ao buscar inscrições', 500, error);
  }
}

export const GET = requireAuth(withRateLimit(apiLimiter, getRegistrationsHandler));

/**
 * POST /api/event-registrations - Criar nova inscrição
 * Protegido com validação Zod + sanitização
 */
async function createRegistrationHandler(request: NextRequest, context: any) {
  try {
    // Valida e sanitiza body com Zod
    const validation = await validateBody(request, createRegistrationSchema);

    if (!validation.success) {
      return validation.error;
    }

    const { personId, eventId, ticketTypeId, createdByUserId } = validation.data;

    // Verificar se ticketType existe e pertence ao evento
    const ticketType = await prisma.ticketType.findFirst({
      where: { id: ticketTypeId, eventId },
      include: { event: true },
    });

    if (!ticketType) {
      return NextResponse.json(
        { error: 'Tipo de ingresso não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se a pessoa existe
    const person = await prisma.person.findUnique({
      where: { id: personId },
    });

    if (!person) {
      return NextResponse.json(
        { error: 'Pessoa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já existe uma inscrição CONFIRMADA ou PENDENTE para esta pessoa neste evento
    const existingConfirmedRegistration = await prisma.eventMembership.findFirst({
      where: {
        personId: personId,
        eventId: eventId,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    if (existingConfirmedRegistration) {
      return NextResponse.json(
        { error: 'Pessoa já possui uma inscrição confirmada ou pendente neste evento' },
        { status: 400 }
      );
    }

    // Verificar capacidade do tipo de ingresso
    if (ticketType.capacity) {
      const currentTicketTypeRegistrations = await prisma.eventMembership.count({
        where: {
          ticketTypeId,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (currentTicketTypeRegistrations >= ticketType.capacity) {
        return NextResponse.json(
          { error: 'Este tipo de ingresso está esgotado' },
          { status: 400 }
        );
      }
    }

    // Verificar capacidade total do evento
    const currentRegistrations = await prisma.eventMembership.count({
      where: {
        eventId: eventId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (
      ticketType.event.capacity &&
      currentRegistrations >= ticketType.event.capacity
    ) {
      return NextResponse.json(
        { error: 'Evento está com lotação completa' },
        { status: 400 }
      );
    }

    // Criar inscrição
    const registration = await prisma.eventMembership.create({
      data: {
        personId: personId,
        eventId: eventId,
        ticketTypeId: ticketTypeId,
        createdByUserId: createdByUserId || context.user.id,
        status: 'PENDING',
      },
      include: {
        person: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            location: true,
            price: true,
            status: true,
          },
        },
        ticketType: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Formatar resposta
    const formattedRegistration = {
      id: registration.id,
      userId: registration.userId,
      eventId: registration.eventId,
      ticketTypeId: registration.ticketTypeId,
      status: registration.status,
      registeredAt: registration.registeredAt,
      person: registration.person,
      event: registration.event,
      ticketType: registration.ticketType,
      createdBy: registration.createdByUser,
    };

    return NextResponse.json(formattedRegistration, { status: 201 });
  } catch (error) {
    return errorResponse('Erro ao criar inscrição', 500, error);
  }
}

export const POST = requireAuth(createRegistrationHandler);
