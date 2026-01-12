import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { updateTicketTypeSchema } from '@/lib/validations';
import { validateBody, validateParams } from '@/lib/validation-middleware';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string().uuid('ID do evento inválido'),
  ticketTypeId: z.string().uuid('ID do tipo de ingresso inválido'),
});

// PUT /api/events/[id]/ticket-types/[ticketTypeId] - Atualizar tipo de ingresso
async function updateTicketTypeHandler(
  request: NextRequest,
  { params }: { params: { id: string; ticketTypeId: string } }
) {
  try {
    const paramsValidation = validateParams(params, paramsSchema);

    if (!paramsValidation.success) {
      return paramsValidation.error;
    }

    const { id: eventId, ticketTypeId } = paramsValidation.data;

    const bodyValidation = await validateBody(request, updateTicketTypeSchema);
    if (!bodyValidation.success) {
      return bodyValidation.error;
    }

    const updates = bodyValidation.data;

    // Validar capacidade se estiver sendo atualizada
    if (updates.capacity !== undefined) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { ticketTypes: true },
      });

      if (event && event.capacity) {
        const otherCapacity = event.ticketTypes
          .filter((tt) => tt.id !== ticketTypeId && tt.capacity)
          .reduce((sum, tt) => sum + Number(tt.capacity || 0), 0);

        if (
          updates.capacity &&
          otherCapacity + updates.capacity > event.capacity
        ) {
          return NextResponse.json(
            { error: 'Capacidade total excede capacidade do evento' },
            { status: 400 }
          );
        }
      }
    }

    const ticketType = await prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: updates,
    });

    return NextResponse.json(ticketType);
  } catch (error) {
    console.error('Error updating ticket type:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tipo de ingresso' },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(updateTicketTypeHandler);

// DELETE /api/events/[id]/ticket-types/[ticketTypeId] - Deletar tipo de ingresso
async function deleteTicketTypeHandler(
  _request: NextRequest,
  { params }: { params: { id: string; ticketTypeId: string } }
) {
  try {
    const paramsValidation = validateParams(params, paramsSchema);

    if (!paramsValidation.success) {
      return paramsValidation.error;
    }

    const { ticketTypeId } = paramsValidation.data;

    // Verificar se há inscrições vinculadas
    const registrationsCount = await prisma.eventMembership.count({
      where: { ticketTypeId },
    });

    if (registrationsCount > 0) {
      return NextResponse.json(
        {
          error:
            'Não é possível excluir tipo de ingresso com inscrições vinculadas',
        },
        { status: 400 }
      );
    }

    await prisma.ticketType.delete({
      where: { id: ticketTypeId },
    });

    return NextResponse.json({
      message: 'Tipo de ingresso removido com sucesso',
    });
  } catch (error) {
    console.error('Error deleting ticket type:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar tipo de ingresso' },
      { status: 500 }
    );
  }
}

export const DELETE = requireAuth(deleteTicketTypeHandler);
