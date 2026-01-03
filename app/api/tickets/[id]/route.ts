import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-utils';

// GET /api/tickets/[id] - Obter ticket específico
export const GET = requirePermission('tickets.view')(
  async (_: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: params.id },
        include: {
          person: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
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
              category: true,
            },
          },
          invoice: {
            include: {
              installments: {
                orderBy: {
                  installmentNumber: 'asc',
                },
                include: {
                  payments: true,
                },
              },
            },
          },
        },
      });

      if (!ticket) {
        return NextResponse.json(
          { error: 'Ticket não encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(ticket);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar ticket' },
        { status: 500 }
      );
    }
  }
);

// PUT /api/tickets/[id] - Atualizar ticket
export const PUT = requirePermission('tickets.create')(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await request.json();
      const { status, ticketType } = body;

      const updateData: any = {};
      if (status) updateData.status = status;
      if (ticketType) updateData.ticketType = ticketType;

      const ticket = await prisma.ticket.update({
        where: { id: params.id },
        data: updateData,
        include: {
          person: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true,
            },
          },
          invoice: {
            include: {
              installments: {
                include: {
                  payments: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(ticket);
    } catch (error) {
      console.error('Error updating ticket:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar ticket' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/tickets/[id] - Cancelar ticket
export const DELETE = requirePermission('tickets.cancel')(
  async (_: NextRequest, { params }: { params: { id: string } }) => {
    try {
      // Marcar como cancelado ao invés de deletar
      const ticket = await prisma.ticket.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
      });

      return NextResponse.json({
        message: 'Ticket cancelado com sucesso',
        ticket,
      });
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      return NextResponse.json(
        { error: 'Erro ao cancelar ticket' },
        { status: 500 }
      );
    }
  }
);
