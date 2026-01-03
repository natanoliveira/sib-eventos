import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-utils';

export const GET = requirePermission('dashboard.view')(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const period = searchParams.get('period') || '30'; // dias

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Total de receita
      const totalRevenue = await prisma.payment.aggregate({
        where: {
          status: 'PAID',
          paidAt: {
            gte: startDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      // Receita por evento (via Invoice)
      const invoicesWithPayments = await prisma.invoice.findMany({
        where: {
          installments: {
            some: {
              payments: {
                some: {
                  status: 'PAID',
                  paidAt: {
                    gte: startDate,
                  },
                },
              },
            },
          },
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
            },
          },
          installments: {
            include: {
              payments: {
                where: {
                  status: 'PAID',
                  paidAt: {
                    gte: startDate,
                  },
                },
              },
            },
          },
        },
      });

      // Agrupar receita por evento
      const revenueByEventMap = new Map<string, { eventId: string; eventTitle: string; revenue: number; payments: number }>();

      for (const invoice of invoicesWithPayments) {
        const eventId = invoice.eventId;
        const eventTitle = invoice.event.title;

        let eventRevenue = 0;
        let eventPayments = 0;

        for (const installment of invoice.installments) {
          for (const payment of installment.payments) {
            eventRevenue += Number(payment.amount);
            eventPayments++;
          }
        }

        if (revenueByEventMap.has(eventId)) {
          const existing = revenueByEventMap.get(eventId)!;
          existing.revenue += eventRevenue;
          existing.payments += eventPayments;
        } else {
          revenueByEventMap.set(eventId, {
            eventId,
            eventTitle,
            revenue: eventRevenue,
            payments: eventPayments,
          });
        }
      }

      const revenueByEvent = Array.from(revenueByEventMap.values());

      // Receita por método de pagamento
      const revenueByMethod = await prisma.payment.groupBy({
        by: ['method'],
        where: {
          status: 'PAID',
          paidAt: {
            gte: startDate,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      });

      // Receita por dia (últimos 30 dias)
      const dailyRevenue = await prisma.$queryRaw`
        SELECT
          DATE("paidAt") as date,
          SUM(amount) as revenue,
          COUNT(*) as payments
        FROM "Payment"
        WHERE status = 'PAID' AND "paidAt" >= ${startDate}
        GROUP BY DATE("paidAt")
        ORDER BY date ASC
      `;

      // Estatísticas gerais
      const stats = await prisma.payment.aggregate({
        where: {
          paidAt: {
            gte: startDate,
          },
        },
        _count: true,
        _sum: {
          amount: true,
        },
      });

      const pendingPayments = await prisma.payment.count({
        where: {
          status: 'PENDING',
        },
      });

      return NextResponse.json({
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        revenueByEvent,
        revenueByMethod: revenueByMethod.map((r) => ({
          method: r.method,
          revenue: Number(r._sum.amount || 0),
          payments: r._count,
        })),
        dailyRevenue,
        stats: {
          totalPayments: stats._count,
          totalAmount: Number(stats._sum.amount || 0),
          pendingPayments,
        },
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar dados de receita' },
        { status: 500 }
      );
    }
  }
);
