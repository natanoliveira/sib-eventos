import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { errorResponse } from '@/lib/api-response';
import { updateRegistrationSchema, cancelRegistrationSchema } from '@/lib/validations';
import { validateBody, validateParams } from '@/lib/validation-middleware';

/**
 * PUT /api/event-registrations/[id] - Atualizar inscrição
 * Protegido com validação Zod + sanitização
 */
async function updateRegistrationHandler(
  request: NextRequest,
  context: any
) {
  try {
    // Valida route params
    const paramsValidation = validateParams(context.params, cancelRegistrationSchema);

    if (!paramsValidation.success) {
      return paramsValidation.error;
    }

    const { id } = paramsValidation.data;

    // Valida e sanitiza body com Zod
    const validation = await validateBody(request, updateRegistrationSchema);

    if (!validation.success) {
      return validation.error;
    }

    const { status } = validation.data;

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
    // Valida route params
    const validation = validateParams(context.params, cancelRegistrationSchema);

    if (!validation.success) {
      return validation.error;
    }

    const { id } = validation.data;

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
