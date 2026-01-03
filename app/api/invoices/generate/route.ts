import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

// POST /api/invoices/generate - Gerar fatura/passaporte com tickets
export const POST = requireAuth(
  async (request: NextRequest, context: any) => {

    try {
      const body = await request.json();
      const {
        personId,
        eventId,
        amount,
        installments = 1,
        ticketQuantity = 1,
        ticketType = 'STANDARD',
      } = body;

      if (!personId || !eventId || !amount) {
        return NextResponse.json(
          { error: 'Dados incompletos' },
          { status: 400 }
        );
      }

      // Verificar se pessoa e evento existem
      const [person, event] = await Promise.all([
        prisma.person.findUnique({ where: { id: personId } }),
        prisma.event.findUnique({ where: { id: eventId } }),
      ]);

      if (!person) {
        return NextResponse.json(
          { error: 'Pessoa não encontrada' },
          { status: 404 }
        );
      }

      if (!event) {
        return NextResponse.json(
          { error: 'Evento não encontrado' },
          { status: 404 }
        );
      }

      // Iniciar transação
      const result = await prisma.$transaction(async (tx) => {
        // 1. Criar Fatura (Invoice)
        const invoiceCount = await tx.invoice.count();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
          invoiceCount + 1
        ).padStart(4, '0')}`;

        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            personId,
            eventId,
            totalAmount: parseFloat(amount),
            status: 'PENDING',
            createdByUserId: context.user.id,
          },
        });

        // 2. Criar Parcelas (Installments)
        const installmentsCount = parseInt(installments);
        const installmentAmount = parseFloat(amount) / installmentsCount;
        const createdInstallments: any[] = [];

        for (let i = 1; i <= installmentsCount; i++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + i - 1);

          const installment = await tx.installment.create({
            data: {
              invoiceId: invoice.id,
              installmentNumber: i,
              amount: installmentAmount,
              dueDate,
              status: 'PENDING',
            },
          });

          createdInstallments.push(installment);
        }

        // 3. Criar Tickets/Passaportes vinculados à fatura
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
              personId,
              eventId,
              invoiceId: invoice.id,
              ticketType,
              price: pricePerTicket,
              qrCode,
              status: 'ACTIVE',
            },
          });

          tickets.push(ticket);
        }

        // 4. Criar ou atualizar inscrição no evento
        await tx.eventMembership.upsert({
          where: {
            personId_eventId: {
              personId,
              eventId,
            },
          },
          create: {
            personId,
            eventId,
            status: 'CONFIRMED',
            createdByUserId: context.user.id,
          },
          update: {
            status: 'CONFIRMED',
          },
        });

        return { invoice, installments: createdInstallments, tickets };
      });

      // Buscar dados completos para retornar
      const invoiceData = await prisma.invoice.findUnique({
        where: { id: result.invoice.id },
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
              description: true,
              startDate: true,
              endDate: true,
              location: true,
            },
          },
          tickets: true,
          installments: {
            orderBy: {
              installmentNumber: 'asc',
            },
            include: {
              payments: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          message: 'Fatura/Passaporte gerado com sucesso',
          invoice: invoiceData,
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
