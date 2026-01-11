import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

// GET /api/dashboard/stats - Obter estatísticas do dashboard
export const GET = requireAuth(
  async (_request: NextRequest) => {
    try {
      // Contar total de pessoas
      const totalMembers = await prisma.person.count({
        where: { status: 'ACTIVE' }
      });

      // Contar eventos ativos
      const activeEvents = await prisma.event.count({
        where: {
          status: { in: ['ACTIVE', 'DRAFT'] },
          startDate: { gte: new Date() }
        }
      });

      // Calcular receita do mês atual
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const monthRevenue = await prisma.payment.aggregate({
        where: {
          status: 'PAID',
          paidAt: {
            gte: currentMonth,
            lt: nextMonth
          }
        },
        _sum: {
          amount: true
        }
      });

      // Calcular receita do mês anterior para comparação
      const previousMonth = new Date(currentMonth);
      previousMonth.setMonth(previousMonth.getMonth() - 1);

      const previousMonthRevenue = await prisma.payment.aggregate({
        where: {
          status: 'PAID',
          paidAt: {
            gte: previousMonth,
            lt: currentMonth
          }
        },
        _sum: {
          amount: true
        }
      });

      // Contar tickets emitidos
      const totalTickets = await prisma.ticket.count({
        where: {
          status: { in: ['ACTIVE', 'USED'] }
        }
      });

      // Contar tickets do mês atual
      const monthTickets = await prisma.ticket.count({
        where: {
          status: { in: ['ACTIVE', 'USED'] },
          createdAt: {
            gte: currentMonth,
            lt: nextMonth
          }
        }
      });

      // Contar tickets do mês anterior
      const previousMonthTickets = await prisma.ticket.count({
        where: {
          status: { in: ['ACTIVE', 'USED'] },
          createdAt: {
            gte: previousMonth,
            lt: currentMonth
          }
        }
      });

      // Calcular mudanças percentuais
      const revenueChange = previousMonthRevenue._sum.amount
        ? ((Number(monthRevenue._sum.amount || 0) - Number(previousMonthRevenue._sum.amount)) / Number(previousMonthRevenue._sum.amount) * 100).toFixed(1)
        : '0.0';

      const ticketsChange = previousMonthTickets > 0
        ? ((monthTickets - previousMonthTickets) / previousMonthTickets * 100).toFixed(1)
        : '0.0';

      // Buscar próximos eventos
      const upcomingEvents = await prisma.event.findMany({
        where: {
          startDate: { gte: new Date() },
          status: { in: ['ACTIVE', 'DRAFT'] }
        },
        include: {
          _count: {
            select: {
              memberships: true
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        },
        take: 5
      });

      const stats = {
        totalMembers,
        activeEvents,
        monthRevenue: Number(monthRevenue._sum.amount || 0),
        totalTickets,
        revenueChange: `${Number(revenueChange) >= 0 ? '+' : ''}${revenueChange}%`,
        revenueChangeType: Number(revenueChange) >= 0 ? 'positive' : 'negative',
        ticketsChange: `${Number(ticketsChange) >= 0 ? '+' : ''}${ticketsChange}%`,
        ticketsChangeType: Number(ticketsChange) >= 0 ? 'positive' : 'negative',
        upcomingEvents: upcomingEvents.map(event => ({
          id: event.id,
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          registrations: event._count.memberships,
          capacity: event.capacity,
          status: event.status
        }))
      };

      return NextResponse.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar estatísticas do dashboard' },
        { status: 500 }
      );
    }
  }
);
