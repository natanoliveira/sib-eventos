import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

// POST /api/events/register - Inscrever pessoa/membro em evento
async function registerEventHandler(request: NextRequest, context: any) {
  try {
    const body = await request.json();
    const { personId, eventId, ticketTypeId } = body;

    if (!personId || !eventId || !ticketTypeId) {
      return NextResponse.json(
        { error: 'personId, eventId e ticketTypeId são obrigatórios' },
        { status: 400 }
      );
    }

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

    // Verificar se pessoa existe
    const person = await prisma.person.findUnique({ where: { id: personId } });

    if (!person) {
      return NextResponse.json(
        { error: 'Pessoa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se evento está aberto
    if (ticketType.event.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Evento não está aberto para inscrições' },
        { status: 400 }
      );
    }

    // Verificar se já existe inscrição CONFIRMADA ou PENDENTE
    const existingRegistration = await prisma.eventMembership.findFirst({
      where: {
        personId,
        eventId,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Você já possui uma inscrição confirmada ou pendente neste evento' },
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
    const totalRegistrations = await prisma.eventMembership.count({
      where: {
        eventId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (
      ticketType.event.capacity &&
      totalRegistrations >= ticketType.event.capacity
    ) {
      return NextResponse.json(
        { error: 'Evento está com lotação completa' },
        { status: 400 }
      );
    }

    // Criar inscrição
    const registration = await prisma.eventMembership.create({
      data: {
        personId,
        eventId,
        ticketTypeId,
        status: 'PENDING', // Pendente até pagamento
        createdByUserId: context.user.id,
      },
      include: {
        person: {
          select: {
            id: true,
            name: true,
            email: true,
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
      },
    });

    return NextResponse.json(
      {
        message: 'Inscrição realizada com sucesso',
        registration,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Erro ao realizar inscrição' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(registerEventHandler);
