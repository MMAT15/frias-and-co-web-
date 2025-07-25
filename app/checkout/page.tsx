'use client'
import { useCart } from '@/lib/cartStore'
import { loadStripe } from '@stripe/stripe-js'

export default function CheckoutPage() {
  const { items, clear } = useCart()
  const checkout = async () => {
    const res = await fetch('/api/stripe', {
      method: 'POST',
      body: JSON.stringify(items),
    })
    const { id } = await res.json()
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || '')
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId: id })
      clear()
    }
  }
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <button onClick={checkout} className="bg-accent px-4 py-2">
        Pagar
      </button>
    </div>
  )
}
