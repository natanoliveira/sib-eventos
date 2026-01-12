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

    // Buscar o evento e ticketType com suas inscrições
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: {
          include: {
            _count: {
              select: { eventMemberships: true }
            }
          }
        }
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    const ticketType = event.ticketTypes.find(tt => tt.id === ticketTypeId);

    if (!ticketType) {
      return NextResponse.json(
        { error: 'Tipo de ingresso não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o evento está ACTIVE e se há inscrições neste ticketType
    const hasRegistrations = ticketType._count.eventMemberships > 0;

    if (event.status === 'ACTIVE' && hasRegistrations) {
      return NextResponse.json(
        {
          error: 'Não é possível editar tipo de ingresso de evento aberto com inscrições vinculadas',
          details: 'Para editar, primeiro cancele ou conclua o evento'
        },
        { status: 400 }
      );
    }

    // Validar capacidade se estiver sendo atualizada
    if (updates.capacity !== undefined && event.capacity) {
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

    const updatedTicketType = await prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: updates,
    });

    return NextResponse.json(updatedTicketType);
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

    const { id: eventId, ticketTypeId } = paramsValidation.data;

    // Buscar o ticketType com o evento e contagem de inscrições
    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: {
        event: {
          select: {
            id: true,
            status: true,
          }
        },
        _count: {
          select: { eventMemberships: true }
        }
      }
    });

    if (!ticketType) {
      return NextResponse.json(
        { error: 'Tipo de ingresso não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o ticketType pertence ao evento especificado
    if (ticketType.event.id !== eventId) {
      return NextResponse.json(
        { error: 'Tipo de ingresso não pertence a este evento' },
        { status: 400 }
      );
    }

    const hasRegistrations = ticketType._count.eventMemberships > 0;

    // Verificar se o evento está ACTIVE e se há inscrições
    if (ticketType.event.status === 'ACTIVE' && hasRegistrations) {
      return NextResponse.json(
        {
          error: 'Não é possível excluir tipo de ingresso de evento aberto com inscrições vinculadas',
          details: 'Para excluir, primeiro cancele as inscrições ou conclua o evento'
        },
        { status: 400 }
      );
    }

    // Verificar se é o único tipo de ingresso do evento
    const totalTicketTypes = await prisma.ticketType.count({
      where: { eventId }
    });

    if (totalTicketTypes <= 1) {
      return NextResponse.json(
        { error: 'Não é possível excluir o único tipo de ingresso do evento' },
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
