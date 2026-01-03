import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth } from '@/lib/auth-utils';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');

    const where: any = {};
    if (userId) where.userId = userId;
    if (eventId) where.eventId = eventId;
    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
        tickets: true,
        paymentInstallments: {
          orderBy: {
            installmentNumber: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pagamentos' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      userId,
      eventId,
      amount,
      method,
      installments = 1,
      stripePaymentIntentId,
      stripeCustomerId,
    } = body;

    if (!userId || !eventId || !amount || !method) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Gerar número de pagamento único
    const paymentCount = await prisma.payment.count();
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(
      paymentCount + 1
    ).padStart(4, '0')}`;

    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        userId,
        eventId,
        amount,
        method,
        installments,
        stripePaymentIntentId,
        stripeCustomerId,
        status: stripePaymentIntentId ? 'PROCESSING' : 'PENDING',
      },
      include: {
        user: true,
        event: true,
      },
    });

    // Se for parcelado, criar as parcelas
    if (installments > 1) {
      const installmentAmount = amount / installments;
      const installmentsData: Prisma.PaymentInstallmentCreateManyInput[] = [];

      for (let i = 1; i <= installments; i++) {
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

      await prisma.paymentInstallment.createMany({
        data: installmentsData,
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Erro ao criar pagamento' },
      { status: 500 }
    );
  }
});
