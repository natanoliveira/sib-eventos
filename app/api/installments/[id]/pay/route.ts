import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

// POST /api/installments/[id]/pay - Pagar parcela (baixa de parcelamento)
export const POST = requireAuth(
  async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    try {
      const body = await request.json();
      const { amount, method, transactionId, stripePaymentIntentId, stripeChargeId, stripeCustomerId } = body;

      // Buscar parcela
      const installment = await prisma.installment.findUnique({
        where: { id: params.id },
        include: {
          invoice: {
            include: {
              tickets: true,
              event: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      if (!installment) {
        return NextResponse.json(
          { error: 'Parcela não encontrada' },
          { status: 404 }
        );
      }

      if (installment.status === 'PAID') {
        return NextResponse.json(
          { error: 'Parcela já foi paga' },
          { status: 400 }
        );
      }

      // Criar pagamento para esta parcela
      const payment = await prisma.payment.create({
        data: {
          paymentNumber: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          installmentId: installment.id,
          amount: amount || installment.amount,
          method: method || 'PIX',
          status: 'PAID',
          paidAt: new Date(),
          transactionId,
          stripePaymentIntentId,
          stripeChargeId,
          stripeCustomerId,
        },
      });

      // Atualizar parcela para paga
      await prisma.installment.update({
        where: { id: params.id },
        data: {
          status: 'PAID',
        },
      });

      // Verificar se todas as parcelas da fatura foram pagas
      const allInstallments = await prisma.installment.findMany({
        where: { invoiceId: installment.invoiceId },
      });

      const allPaid = allInstallments.every((inst) => inst.status === 'PAID');

      // Se todas pagas, atualizar fatura
      if (allPaid) {
        await prisma.invoice.update({
          where: { id: installment.invoiceId },
          data: {
            status: 'PAID',
          },
        });

        // Ativar todos os tickets vinculados à fatura
        await prisma.ticket.updateMany({
          where: { invoiceId: installment.invoiceId },
          data: { status: 'ACTIVE' },
        });
      } else {
        // Atualizar para parcialmente pago
        await prisma.invoice.update({
          where: { id: installment.invoiceId },
          data: {
            status: 'PARTIALLY_PAID',
          },
        });
      }

      // Retornar dados atualizados
      const result = await prisma.installment.findUnique({
        where: { id: params.id },
        include: {
          payments: true,
          invoice: {
            include: {
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
          },
        },
      });

      return NextResponse.json({
        message: 'Parcela paga com sucesso',
        installment: result,
        payment,
        allPaid,
      });
    } catch (error) {
      console.error('Error paying installment:', error);
      return NextResponse.json(
        { error: 'Erro ao pagar parcela' },
        { status: 500 }
      );
    }
  }
);
