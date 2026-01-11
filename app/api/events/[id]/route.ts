import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { updateEventSchema, deleteEventSchema } from '@/lib/validations';
import { validateBody, validateParams } from '@/lib/validation-middleware';

// GET /api/events/[id] - Obter evento específico
async function getEventHandler(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Valida route params
    const validation = validateParams(params, deleteEventSchema);

    if (!validation.success) {
      return validation.error;
    }

    const { id } = validation.data;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        memberships: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tickets: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        invoices: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            installments: {
              include: {
                payments: {
                  select: {
                    id: true,
                    amount: true,
                    method: true,
                    status: true,
                    paidAt: true,
                  },
                },
              },
            },
          },
        },
      },
      relationLoadStrategy: 'join',
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getEventHandler);

// PUT /api/events/[id] - Atualizar evento
// Protegido com validação Zod + sanitização
export const PUT = requireAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      // Valida route params
      const paramsValidation = validateParams(params, deleteEventSchema);

      if (!paramsValidation.success) {
        return paramsValidation.error;
      }

      const { id } = paramsValidation.data;

      // Valida e sanitiza body com Zod
      const validation = await validateBody(request, updateEventSchema);

      if (!validation.success) {
        return validation.error;
      }

      const {
        title,
        description,
        startDate,
        endDate,
        location,
        capacity,
        price,
        category,
        status,
        imageUrl,
      } = validation.data;

      const event = await prisma.event.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(startDate !== undefined && { startDate: new Date(startDate) }),
          ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
          ...(location !== undefined && { location }),
          ...(capacity !== undefined && { capacity }),
          ...(price !== undefined && { price }),
          ...(category !== undefined && { category }),
          ...(status !== undefined && { status }),
          ...(imageUrl !== undefined && { imageUrl }),
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json(event);
    } catch (error) {
      console.error('Error updating event:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar evento' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/events/[id] - Deletar evento
export const DELETE = requireAuth(
  async (_: NextRequest, { params }: { params: { id: string } }) => {
    try {
      // Valida route params
      const validation = validateParams(params, deleteEventSchema);

      if (!validation.success) {
        return validation.error;
      }

      const { id } = validation.data;

      await prisma.event.update({
        where: { id },
        data: { removed: true, status: 'CANCELLED' },
      });

      return NextResponse.json({ message: 'Evento removido com sucesso' });
    } catch (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar evento' },
        { status: 500 }
      );
    }
  }
);
