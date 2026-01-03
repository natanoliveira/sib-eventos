import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth } from '@/lib/auth-utils';

// POST /api/invoices/generate - Gerar fatura/passaporte com tickets
export const POST = requireAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const {
        userId,
        eventId,
        amount,
        method,
        installments = 1,
        ticketQuantity = 1,
        ticketType = 'STANDARD',
        memberId,
      } = body;

      if (!userId || !eventId || !amount || !method) {
        return NextResponse.json(
          { error: 'Dados incompletos' },
          { status: 400 }
        );
      }

      // Verificar se usuário e evento existem
      const [event] = await Promise.all([
        prisma.event.findUnique({ where: { id: eventId } }),
      ]);

      if (!event) {
        return NextResponse.json(
          { error: 'Evento não encontrado' },
          { status: 404 }
        );
      }

      // Iniciar transação
      const result = await prisma.$transaction(async (tx) => {
        // 1. Criar pagamento
        const paymentCount = await tx.payment.count();
        const paymentNumber = `PAY-${new Date().getFullYear()}-${String(
          paymentCount + 1
        ).padStart(4, '0')}`;

        const payment = await tx.payment.create({
          data: {
            paymentNumber,
            userId,
            eventId,
            amount: parseFloat(amount),
            method,
            installments: parseInt(installments),
            status: 'PENDING',
          },
        });

        // 2. Criar parcelas se houver
        if (parseInt(installments) > 1) {
          const installmentAmount = parseFloat(amount) / parseInt(installments);
          const installmentsData: Prisma.PaymentInstallmentCreateManyInput[] = [];

          for (let i = 1; i <= parseInt(installments); i++) {
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + i);

            installmentsData.push({
              paymentId: payment.id,
              installmentNumber: i,
              amount: installmentAmount,
              dueDate,
              status: 'PENDING',
            });
          }

          await tx.paymentInstallment.createMany({
            data: installmentsData,
          });
        }

        // 3. Criar tickets/passaportes vinculados ao pagamento
        const tickets = [];
        const ticketCount = await tx.ticket.count();
        const pricePerTicket = parseFloat(amount) / parseInt(ticketQuantity);

        for (let i = 1; i <= parseInt(ticketQuantity); i++) {
          const ticketNumber = `TKT-${event.title
            .substring(0, 4)
            .toUpperCase()}-${new Date().getFullYear()}-${String(
            ticketCount + i
          ).padStart(4, '0')}`;
          const qrCode = `QR-${ticketNumber}-${Date.now()}-${i}`;

          const ticket = await tx.ticket.create({
            data: {
              ticketNumber,
              userId,
              eventId,
              ticketType,
              price: pricePerTicket,
              qrCode,
              status: 'ACTIVE',
              paymentId: payment.id,
            },
          });

          tickets.push(ticket);
        }

        // 4. Criar ou atualizar inscrição no evento
        if (memberId) {
          await tx.eventMembership.upsert({
            where: {
              memberId_eventId: {
                memberId,
                eventId,
              },
            },
            create: {
              memberId,
              eventId,
              status: 'CONFIRMED',
              createdByUserId: userId,
            },
            update: {
              status: 'CONFIRMED',
              createdByUserId: userId,
            },
          });
        }

        return { payment, tickets };
      });

      // Buscar dados completos para retornar
      const invoice = await prisma.payment.findUnique({
        where: { id: result.payment.id },
        include: {
          user: {
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
              description: true,
              startDate: true,
              endDate: true,
              location: true,
            },
          },
          tickets: true,
          paymentInstallments: {
            orderBy: {
              installmentNumber: 'asc',
            },
          },
        },
      });

      return NextResponse.json(
        {
          message: 'Fatura/Passaporte gerado com sucesso',
          invoice,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error generating invoice:', error);
      return NextResponse.json(
        { error: 'Erro ao gerar fatura/passaporte' },
        { status: 500 }
      );
    }
  }
);
