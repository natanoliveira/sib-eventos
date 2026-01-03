import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/events/register - Inscrever membro em evento (público)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, eventId } = body;

    if (!memberId || !eventId) {
      return NextResponse.json(
        { error: 'memberId e eventId são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se membro e evento existem
    const [member, event] = await Promise.all([
      prisma.member.findUnique({ where: { id: memberId } }),
      prisma.event.findUnique({ where: { id: eventId } }),
    ]);

    if (!member) {
      return NextResponse.json(
        { error: 'Membro não encontrado' },
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
          personId: memberId,
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
        memberId,
        eventId,
        status: 'PENDING', // Pendente até pagamento
        createdByUserId: null, // público
      },
      include: {
        member: {
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

    return NextResponse.json({
      message: 'Inscrição realizada com sucesso',
      registration,
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Erro ao realizar inscrição' },
      { status: 500 }
    );
  }
}
