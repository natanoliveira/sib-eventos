import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    console.log();
    console.log(searchParams);
    console.log();
    const personId = searchParams.get('personId');
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');

    // Build where clause for filtering via relationships
    const where: any = {};

    if (status) {
      where.status = status;
    }

    // Filter by person or event requires traversing through installment -> invoice
    if (personId || eventId) {
      where.installment = {
        invoice: {
          ...(personId && { personId }),
          ...(eventId && { eventId }),
        },
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        installment: {
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pagamentos' },
      { status: 500 }
    );
  }
});

// POST endpoint not used in new flow
// Payments are created via /api/installments/[id]/pay
// This endpoint returns a message directing to the correct flow
export const POST = requireAuth(async (_: NextRequest) => {
  return NextResponse.json(
    {
      error: 'Use /api/invoices/generate para criar fatura com parcelas, e /api/installments/[id]/pay para pagar uma parcela específica',
      message: 'Este endpoint não é mais utilizado no novo fluxo de pagamentos'
    },
    { status: 400 }
  );
});
