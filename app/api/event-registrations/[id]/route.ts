import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { errorResponse } from '@/lib/api-response';

/**
 * PUT /api/event-registrations/[id] - Atualizar inscrição
 *
 * Body:
 * - status: PENDING | CONFIRMED | CANCELLED
 */
async function updateRegistrationHandler(
  request: NextRequest,
  context: any
) {
  try {
    const id = context.params.id;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      );
    }

    // Validar status
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    // Verificar se a inscrição existe
    const existingRegistration = await prisma.eventMembership.findUnique({
      where: { id },
    });

    if (!existingRegistration) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar inscrição
    const registration = await prisma.eventMembership.update({
      where: { id },
      data: { status },
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
      personId: registration.personId,
      userId: registration.userId, // ID do usuário logado (se houver)
      eventId: registration.eventId,
      status: registration.status,
      registeredAt: registration.registeredAt,
      user: registration.person,
      event: registration.event,
      createdBy: registration.createdByUser,
    };

    return NextResponse.json(formattedRegistration);
  } catch (error) {
    return errorResponse('Erro ao atualizar inscrição', 500, error);
  }
}

export const PUT = requireAuth(updateRegistrationHandler);

/**
 * DELETE /api/event-registrations/[id] - Deletar inscrição
 */
async function deleteRegistrationHandler(
  _request: NextRequest,
  context: any
) {
  try {
    const id = context.params.id;

    // Verificar se a inscrição existe
    const existingRegistration = await prisma.eventMembership.findUnique({
      where: { id },
    });

    if (!existingRegistration) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }

    // Deletar inscrição
    await prisma.eventMembership.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Inscrição deletada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse('Erro ao deletar inscrição', 500, error);
  }
}

export const DELETE = requireAuth(deleteRegistrationHandler);
