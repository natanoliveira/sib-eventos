import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

// GET /api/installments - Listar parcelas
export const GET = requireAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const invoiceId = searchParams.get('invoiceId');
      const status = searchParams.get('status');
      const personId = searchParams.get('personId');
      const eventId = searchParams.get('eventId');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (invoiceId) {
        where.invoiceId = invoiceId;
      }

      // Filter by person or event via invoice relationship
      if (personId || eventId) {
        where.invoice = {
          ...(personId && { personId }),
          ...(eventId && { eventId }),
        };
      }

      // Contar total de registros
      const total = await prisma.installment.count({ where });

      // Buscar dados paginados
      const installments = await prisma.installment.findMany({
        where,
        include: {
          invoice: {
            include: {
              person: {
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
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              paymentNumber: true,
              amount: true,
              method: true,
              status: true,
              paidAt: true,
            },
          },
        },
        relationLoadStrategy: 'join',
        orderBy: {
          dueDate: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        data: installments,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.error('Error fetching installments:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar parcelas' },
        { status: 500 }
      );
    }
  }
);
