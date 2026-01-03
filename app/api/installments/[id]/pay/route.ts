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
      const { stripePaymentIntentId, stripeChargeId } = body;

      // Buscar parcela
      const installment = await prisma.paymentInstallment.findUnique({
        where: { id: params.id },
        include: {
          payment: {
            include: {
              tickets: true,
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

      // Atualizar parcela para paga
      await prisma.paymentInstallment.update({
        where: { id: params.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          stripePaymentIntentId,
          stripeChargeId,
        },
      });

      // Verificar se todas as parcelas foram pagas
      const allInstallments = await prisma.paymentInstallment.findMany({
        where: { paymentId: installment.paymentId },
      });

      const allPaid = allInstallments.every((inst) => inst.status === 'PAID');

      // Se todas pagas, atualizar pagamento principal
      if (allPaid) {
        await prisma.payment.update({
          where: { id: installment.paymentId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });

        // Ativar todos os tickets vinculados
        await prisma.ticket.updateMany({
          where: { paymentId: installment.paymentId },
          data: { status: 'ACTIVE' },
        });
      }

      // Retornar dados atualizados
      const result = await prisma.paymentInstallment.findUnique({
        where: { id: params.id },
        include: {
          payment: {
            include: {
              tickets: true,
              paymentInstallments: {
                orderBy: {
                  installmentNumber: 'asc',
                },
              },
            },
          },
        },
      });

      return NextResponse.json({
        message: 'Parcela paga com sucesso',
        installment: result,
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
