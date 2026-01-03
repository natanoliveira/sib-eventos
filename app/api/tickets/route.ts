import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-utils';

// GET /api/tickets - Listar tickets
export const GET = requirePermission('tickets.view')(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');
      const eventId = searchParams.get('eventId');
      const status = searchParams.get('status');
      const search = searchParams.get('search');

      const where: any = {};
      if (userId) where.userId = userId;
      if (eventId) where.eventId = eventId;
      if (status) where.status = status;
      if (search) {
        where.ticketNumber = { contains: search, mode: 'insensitive' };
      }

      const tickets = await prisma.ticket.findMany({
        where,
        include: {
          user: {
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
          payment: {
            select: {
              id: true,
              paymentNumber: true,
              amount: true,
              status: true,
              method: true,
              installments: true,
              paymentInstallments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar tickets' },
        { status: 500 }
      );
    }
  }
);

// POST /api/tickets - Criar ticket (passaporte)
export const POST = requirePermission('tickets.create')(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const {
        userId,
        eventId,
        ticketType = 'STANDARD',
        price,
        paymentId,
      } = body;

      if (!userId || !eventId || price === undefined) {
        return NextResponse.json(
          { error: 'Dados incompletos' },
          { status: 400 }
        );
      }

      // Verificar se evento existe
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        return NextResponse.json(
          { error: 'Evento não encontrado' },
          { status: 404 }
        );
      }

      // Gerar número único do ticket
      const ticketCount = await prisma.ticket.count();
      const ticketNumber = `TKT-${event.title.substring(0, 4).toUpperCase()}-${new Date().getFullYear()}-${String(
        ticketCount + 1
      ).padStart(4, '0')}`;

      // Gerar QR Code único
      const qrCode = `QR-${ticketNumber}-${Date.now()}`;

      const ticket = await prisma.ticket.create({
        data: {
          ticketNumber,
          userId,
          eventId,
          ticketType,
          price: parseFloat(price),
          qrCode,
          status: 'ACTIVE',
          paymentId,
        },
        include: {
          user: {
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
          payment: {
            select: {
              id: true,
              paymentNumber: true,
              amount: true,
              status: true,
            },
          },
        },
      });

      return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
      console.error('Error creating ticket:', error);
      return NextResponse.json(
        { error: 'Erro ao criar ticket' },
        { status: 500 }
      );
    }
  }
);
