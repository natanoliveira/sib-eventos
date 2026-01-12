import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { errorResponse } from '@/lib/api-response';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';
import { getPaymentsQuerySchema } from '@/lib/validations';
import { validateQuery } from '@/lib/validation-middleware';

/**
 * GET /api/payments - Listar pagamentos com paginação
 *
 * Proteções implementadas:
 * - Rate limiting: 60 requests/minuto
 * - Validação Zod de query parameters
 * - Autenticação obrigatória
 * - Filtragem por status, método, data, busca
 */
async function getPaymentsHandler(request: NextRequest) {
  try {
    // Valida query parameters com Zod
    const validation = validateQuery(request, getPaymentsQuerySchema);

    if (!validation.success) {
      return validation.error;
    }

    const { search, status, method, startDate, endDate } = validation.data;
    const page = validation.data.page ?? 1;
    const limit = validation.data.limit ?? 10;

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
    return errorResponse('Erro ao buscar pagamentos', 500, error);
  }
}

// Aplicar rate limiting para proteção contra abuse
export const GET = requireAuth(withRateLimit(apiLimiter, getPaymentsHandler));

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
