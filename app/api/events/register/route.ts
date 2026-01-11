import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

// POST /api/events/register - Inscrever pessoa/membro em evento
async function registerEventHandler(request: NextRequest, context: any) {
  try {
    const body = await request.json();
    const { personId, eventId } = body;

    if (!personId || !eventId) {
      return NextResponse.json(
        { error: 'personId e eventId são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se pessoa e evento existem
    const [person, event] = await Promise.all([
      prisma.person.findUnique({ where: { id: personId } }),
      prisma.event.findUnique({ where: { id: eventId } }),
    ]);

    if (!person) {
      return NextResponse.json(
        { error: 'Pessoa não encontrada' },
        { status: 404 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se evento está aberto
    if (event.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Evento não está aberto para inscrições' },
        { status: 400 }
      );
    }

    // Verificar se já existe inscrição
    const existingRegistration = await prisma.eventMembership.findUnique({
      where: {
        personId_eventId: {
          personId,
          eventId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Você já está inscrito neste evento' },
        { status: 400 }
      );
    }

    // Criar inscrição
    const registration = await prisma.eventMembership.create({
      data: {
        personId,
        eventId,
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
