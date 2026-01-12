import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { errorResponse } from '@/lib/api-response';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';

/**
 * GET /api/invoices - Listar faturas
 *
 * Proteções implementadas:
 * - Rate limiting: 60 requests/minuto
 * - Autenticação obrigatória
 * - Filtragem por pessoa, evento, status, busca
 */
async function getInvoicesHandler(request: NextRequest) {
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
        where.invoiceNumber = { contains: search, mode: 'insensitive' };
      }

      const invoices = await prisma.invoice.findMany({
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
              price: true,
            },
          },
          installments: {
            orderBy: {
              installmentNumber: 'asc',
            },
            include: {
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
          },
          tickets: {
            select: {
              id: true,
              ticketNumber: true,
              status: true,
              qrCode: true,
            },
          },
        },
        relationLoadStrategy: 'join',
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(invoices);
    } catch (error) {
      return errorResponse('Erro ao buscar faturas', 500, error);
    }
}

// Aplicar rate limiting para proteção contra abuse
export const GET = requireAuth(withRateLimit(apiLimiter, getInvoicesHandler));
