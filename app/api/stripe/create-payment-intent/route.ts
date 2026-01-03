import { NextRequest, NextResponse } from 'next/server';
import { stripe, createPaymentIntent } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, eventId, userId, installments = 1 } = body;

    if (!amount || !eventId || !userId) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Buscar evento
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    // Criar customer no Stripe se não existir
    const customer = await prisma.user.findUnique({
      where: { id: userId },
    });

    let stripeCustomerId = null;

    if (customer?.email) {
      const stripeCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.name || undefined,
        metadata: {
          userId: customer.id,
        },
      });
      stripeCustomerId = stripeCustomer.id;
    }

    // Criar Payment Intent
    const paymentIntent = await createPaymentIntent(
      amount,
      'brl',
      {
        eventId,
        userId,
        eventTitle: event.title,
        installments: installments.toString(),
      }
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: stripeCustomerId,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Erro ao criar intenção de pagamento' },
      { status: 500 }
    );
  }
}
