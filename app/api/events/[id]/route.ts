import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

// GET /api/events/[id] - Obter evento específico
async function getEventHandler(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
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
export const PUT = requireAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await request.json();
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
      } = body;

      const event = await prisma.event.update({
        where: { id: params.id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
          ...(location && { location }),
          ...(capacity !== undefined && { capacity: parseInt(capacity) }),
          ...(price !== undefined && { price: parseFloat(price) }),
          ...(category && { category }),
          ...(status && { status }),
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
      await prisma.event.update({
        where: { id: params.id },
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
