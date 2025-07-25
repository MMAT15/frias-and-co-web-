import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
})

export async function POST(request: Request) {
  const items = await request.json()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: items.map((item: any) => ({
      price_data: {
        currency: 'ars',
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    })),
    success_url: `${request.headers.get('origin')}/success`,
    cancel_url: `${request.headers.get('origin')}/cart`,
  })

  return NextResponse.json({ id: session.id })
}
