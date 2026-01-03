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

      // Atualizar pagamento no banco
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      // Atualizar parcela se for pagamento parcelado
      await prisma.paymentInstallment.updateMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

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

      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: refund.payment_intent as string },
        data: { status: 'REFUNDED' },
      });

      console.log('Charge refunded:', refund.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
