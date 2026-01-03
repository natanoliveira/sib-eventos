import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Assinatura ausente' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Assinatura inválida' },
      { status: 400 }
    );
  }

  // Processar eventos do Stripe
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Buscar pagamento pelo stripePaymentIntentId
      const payments = await prisma.payment.findMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: {
          installment: {
            include: {
              invoice: true,
            },
          },
        },
      });

      if (payments.length === 0) {
        console.log('No payment found for PaymentIntent:', paymentIntent.id);
        break;
      }

      // Atualizar cada pagamento encontrado
      for (const payment of payments) {
        // Atualizar status do pagamento
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });

        // Atualizar status da parcela
        await prisma.installment.update({
          where: { id: payment.installmentId },
          data: { status: 'PAID' },
        });

        // Verificar se todas as parcelas da fatura foram pagas
        const allInstallments = await prisma.installment.findMany({
          where: { invoiceId: payment.installment.invoiceId },
        });

        const allPaid = allInstallments.every((inst) => inst.status === 'PAID');

        if (allPaid) {
          // Atualizar fatura para paga
          await prisma.invoice.update({
            where: { id: payment.installment.invoiceId },
            data: { status: 'PAID' },
          });

          // Ativar todos os tickets vinculados à fatura
          await prisma.ticket.updateMany({
            where: { invoiceId: payment.installment.invoiceId },
            data: { status: 'ACTIVE' },
          });
        } else {
          // Atualizar para parcialmente pago
          await prisma.invoice.update({
            where: { id: payment.installment.invoiceId },
            data: { status: 'PARTIALLY_PAID' },
          });
        }
      }

      console.log('Payment succeeded:', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;

      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: failedPayment.id },
        data: { status: 'FAILED' },
      });

      console.log('Payment failed:', failedPayment.id);
      break;

    case 'charge.refunded':
      const refund = event.data.object as Stripe.Charge;

      // Buscar pagamentos associados ao refund
      const refundedPayments = await prisma.payment.findMany({
        where: { stripePaymentIntentId: refund.payment_intent as string },
        include: {
          installment: true,
        },
      });

      for (const payment of refundedPayments) {
        // Atualizar pagamento
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'REFUNDED' },
        });

        // Reverter status da parcela
        await prisma.installment.update({
          where: { id: payment.installmentId },
          data: { status: 'PENDING' },
        });

        // Atualizar status da fatura
        const allInstallments = await prisma.installment.findMany({
          where: { invoiceId: payment.installment.invoiceId },
        });

        const anyPaid = allInstallments.some((inst) => inst.status === 'PAID');
        const allPaid = allInstallments.every((inst) => inst.status === 'PAID');

        if (allPaid) {
          await prisma.invoice.update({
            where: { id: payment.installment.invoiceId },
            data: { status: 'PAID' },
          });
        } else if (anyPaid) {
          await prisma.invoice.update({
            where: { id: payment.installment.invoiceId },
            data: { status: 'PARTIALLY_PAID' },
          });
        } else {
          await prisma.invoice.update({
            where: { id: payment.installment.invoiceId },
            data: { status: 'PENDING' },
          });
        }
      }

      console.log('Charge refunded:', refund.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
