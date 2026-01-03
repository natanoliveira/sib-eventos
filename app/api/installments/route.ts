import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-utils';

// GET /api/installments - Listar parcelas
export const GET = requirePermission('dashboard.view')(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const invoiceId = searchParams.get('invoiceId');
      const status = searchParams.get('status');
      const personId = searchParams.get('personId');
      const eventId = searchParams.get('eventId');

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
        orderBy: {
          dueDate: 'asc',
        },
      });

      return NextResponse.json(installments);
    } catch (error) {
      console.error('Error fetching installments:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar parcelas' },
        { status: 500 }
      );
    }
  }
);
