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

      // Receita por evento
      const revenueByEvent = await prisma.payment.groupBy({
        by: ['eventId'],
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

      // Buscar detalhes dos eventos
      const eventIds = revenueByEvent.map((r) => r.eventId);
      const events = await prisma.event.findMany({
        where: {
          id: {
            in: eventIds,
          },
        },
        select: {
          id: true,
          title: true,
        },
      });

      const revenueData = revenueByEvent.map((r) => {
        const event = events.find((e) => e.id === r.eventId);
        return {
          eventId: r.eventId,
          eventTitle: event?.title || 'Desconhecido',
          revenue: Number(r._sum.amount || 0),
          payments: r._count,
        };
      });

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
          DATE(paidAt) as date,
          SUM(amount) as revenue,
          COUNT(*) as payments
        FROM Payment
        WHERE status = 'PAID' AND paidAt >= ${startDate}
        GROUP BY DATE(paidAt)
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
        revenueByEvent: revenueData,
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
