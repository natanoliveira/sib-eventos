import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { getInstallmentsQuerySchema } from '@/lib/validations';
import { validateQuery } from '@/lib/validation-middleware';

// GET /api/installments - Listar parcelas
// Protegido com validação Zod
export const GET = requireAuth(
  async (request: NextRequest) => {
    try {
      // Valida query parameters com Zod
      const validation = validateQuery(request, getInstallmentsQuerySchema);

      if (!validation.success) {
        return validation.error;
      }

      const { search, status, invoiceId, personId } = validation.data;
      const page = validation.data.page ?? 1;
      const limit = validation.data.limit ?? 10;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (invoiceId) {
        where.invoiceId = invoiceId;
      }

      // Filter by person via invoice relationship
      if (personId) {
        where.invoice = {
          personId,
        };
      }

      // Search by person name or invoice number
      if (search) {
        where.OR = [
          {
            invoice: {
              person: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
          {
            invoice: {
              invoiceNumber: { contains: search, mode: 'insensitive' },
            },
          },
        ];
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
