import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getUserFromRequest } from '@/lib/auth-utils';
import { errorResponse } from '@/lib/api-response';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';

/**
 * GET /api/event-registrations - Listar inscrições em eventos
 *
 * Query params:
 * - eventId: Filtrar por evento específico
 * - userId: Filtrar por usuário/pessoa específica (personId)
 * - status: Filtrar por status (PENDING, CONFIRMED, CANCELLED)
 */
async function getRegistrationsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const userId = searchParams.get('userId'); // Na verdade é personId
    const status = searchParams.get('status');

    const where: any = {};
    if (eventId) where.eventId = eventId;
    if (userId) where.personId = userId;
    if (status) where.status = status;

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
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        registeredAt: 'desc',
      },
    });

    // Formatar resposta para compatibilidade com o frontend
    const formattedRegistrations = registrations.map((reg) => ({
      id: reg.id,
      userId: reg.userId, // Mapear personId para userId
      eventId: reg.eventId,
      status: reg.status,
      registeredAt: reg.registeredAt,
      person: reg.person, // Mapear person para person
      event: reg.event,
      createdBy: reg.createdByUser,
    }));

    return NextResponse.json(formattedRegistrations);
  } catch (error) {
    return errorResponse('Erro ao buscar inscrições', 500, error);
  }
}

export const GET = withRateLimit(apiLimiter, getRegistrationsHandler);

/**
 * POST /api/event-registrations - Criar nova inscrição
 *
 * Body:
 * - userId: ID da pessoa (personId)
 * - eventId: ID do evento
 */
async function createRegistrationHandler(request: NextRequest, context: any) {
  try {
    const body = await request.json();
    const { persoId, userId, eventId } = body;

    if (!persoId && !userId && !eventId) {
      return NextResponse.json(
        { error: 'persoId, userId e eventId são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a pessoa existe
    const person = await prisma.person.findUnique({
      where: { id: persoId },
    });

    if (!person) {
      return NextResponse.json(
        { error: 'Pessoa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já existe uma inscrição CONFIRMADA ou PENDENTE para esta pessoa neste evento
    const existingConfirmedRegistration = await prisma.eventMembership.findFirst({
      where: {
        personId: persoId,
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

    // Verificar capacidade do evento
    const currentRegistrations = await prisma.eventMembership.count({
      where: {
        eventId: eventId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (currentRegistrations >= event.capacity) {
      return NextResponse.json(
        { error: 'Evento está com lotação completa' },
        { status: 400 }
      );
    }

    // Criar inscrição
    const registration = await prisma.eventMembership.create({
      data: {
        personId: persoId,
        eventId: eventId,
        // userId: userId,
        createdByUserId: context.user.id,
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
      status: registration.status,
      registeredAt: registration.registeredAt,
      person: registration.person,
      event: registration.event,
      createdBy: registration.createdByUser,
    };

    return NextResponse.json(formattedRegistration, { status: 201 });
  } catch (error) {
    return errorResponse('Erro ao criar inscrição', 500, error);
  }
}

export const POST = requireAuth(createRegistrationHandler);
