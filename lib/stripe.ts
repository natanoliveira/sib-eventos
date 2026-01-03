import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'brl',
  metadata?: Record<string, string>
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

export const createCustomer = async (
  email: string,
  name?: string,
  metadata?: Record<string, string>
) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    })

    return customer
  } catch (error) {
    console.error('Error creating customer:', error)
    throw error
  }
}

export const refundPayment = async (paymentIntentId: string) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    })

    return refund
  } catch (error) {
    console.error('Error creating refund:', error)
    throw error
  }
}
