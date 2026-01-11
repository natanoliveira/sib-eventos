import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { getPaymentsQuerySchema } from '@/lib/validations';
import { validateQuery } from '@/lib/validation-middleware';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    // Valida query parameters com Zod
    const validation = validateQuery(request, getPaymentsQuerySchema);

    if (!validation.success) {
      return validation.error;
    }

    const { page, limit, search, status, method, startDate, endDate } = validation.data;

    // Build where clause for filtering via relationships
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (method) {
      where.method = method;
    }

    if (startDate || endDate) {
      where.paidAt = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    // Search by person name or transaction ID
    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: 'insensitive' } },
        {
          installment: {
            invoice: {
              person: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    // Contar total de registros
    const total = await prisma.payment.count({ where });

    // Buscar dados paginados
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
      relationLoadStrategy: 'join',
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: payments,
      total,
      page,
      limit,
      totalPages,
    });
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
