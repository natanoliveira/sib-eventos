import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

// GET /api/tickets - Listar tickets
export const GET = requireAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const personId = searchParams.get('personId');
      const eventId = searchParams.get('eventId');
      const status = searchParams.get('status');
      const search = searchParams.get('search');

      const where: any = {};
      if (personId) where.personId = personId;
      if (eventId) where.eventId = eventId;
      if (status) where.status = status;
      if (search) {
        where.ticketNumber = { contains: search, mode: 'insensitive' };
      }

      const tickets = await prisma.ticket.findMany({
        where,
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
            select: {
              id: true,
              invoiceNumber: true,
              totalAmount: true,
              status: true,
              installments: {
                select: {
                  id: true,
                  installmentNumber: true,
                  amount: true,
                  status: true,
                  dueDate: true,
                },
              },
            },
          },
        },
        relationLoadStrategy: 'join',
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

// POST /api/tickets - Criar ticket não é mais usado diretamente
// Tickets agora são criados via /api/invoices/generate
export const POST = requireAuth(
  async (_: NextRequest) => {
    return NextResponse.json(
      {
        error: 'Use /api/invoices/generate para criar faturas com tickets',
        message: 'Tickets agora são criados automaticamente ao gerar uma fatura'
      },
      { status: 400 }
    );
  }
);
