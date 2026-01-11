import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { errorResponse } from '@/lib/api-response';

/**
 * DELETE /api/payments/[id] - Cancelar pagamento
 *
 * Cancela um pagamento alterando seu status para CANCELLED.
 *
 * Proteções implementadas:
 * - Requer autenticação
 * - Valida existência do pagamento
 * - Não permite cancelar pagamentos já cancelados
 *
 * TODO: Futura integração com Stripe para estorno real
 * Quando integrar com Stripe, descomentar a lógica abaixo:
 *
 * // Verificar se tem stripePaymentIntentId
 * if (payment.stripePaymentIntentId) {
 *   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
 *
 *   try {
 *     // Criar refund no Stripe
 *     const refund = await stripe.refunds.create({
 *       payment_intent: payment.stripePaymentIntentId,
 *     });
 *
 *     // Atualizar payment com informações do refund
 *     await prisma.payment.update({
 *       where: { id },
 *       data: {
 *         status: 'CANCELLED',
 *         stripeRefundId: refund.id,
 *         updatedAt: new Date(),
 *       },
 *     });
 *   } catch (stripeError) {
 *     return errorResponse('Erro ao processar estorno no Stripe', 500, stripeError);
 *   }
 * }
 */
async function cancelPaymentHandler(
  _request: NextRequest,
  context: any
) {
  try {
    const id = context.params.id;

    // Verificar se o pagamento existe
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        installment: {
          include: {
            invoice: {
              include: {
                person: true,
                event: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o pagamento já está cancelado
    if (payment.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Pagamento já está cancelado' },
        { status: 400 }
      );
    }

    // Verificar se o pagamento pode ser cancelado (apenas PAID pode ser cancelado)
    if (payment.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Apenas pagamentos confirmados podem ser cancelados' },
        { status: 400 }
      );
    }

    // Cancelar o pagamento (apenas altera status no banco de dados)
    const cancelledPayment = await prisma.$transaction(async (tx) => {
      // Atualizar status do pagamento
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
        include: {
          installment: {
            include: {
              invoice: {
                include: {
                  person: true,
                  event: true,
                },
              },
            },
          },
        },
      });

      // Atualizar status da parcela de volta para PENDING
      if (payment.installmentId) {
        await tx.installment.update({
          where: { id: payment.installmentId },
          data: {
            status: 'PENDING',
          },
        });
      }

      return updatedPayment;
    });

    return NextResponse.json({
      message: 'Pagamento cancelado com sucesso',
      payment: cancelledPayment,
    });
  } catch (error) {
    return errorResponse('Erro ao cancelar pagamento', 500, error);
  }
}

export const DELETE = requireAuth(cancelPaymentHandler);
