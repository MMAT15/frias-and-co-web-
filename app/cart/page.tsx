'use client'
import { useCart } from '@/lib/cartStore'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const { items, remove } = useCart()
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-semibold">Carrito</h1>
      {items.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="flex items-center gap-2 py-2">
                  <div className="relative w-16 h-16">
                    <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                  </div>
                  {item.name}
                </td>
                <td>{item.quantity}</td>
                <td>${item.price * item.quantity}</td>
                <td>
                  <button onClick={() => remove(item.id)}>Quitar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="text-right space-y-2">
        <p>Subtotal: ${total}</p>
        <p>Envío: Free shipping 🇦🇷</p>
        <p className="font-semibold">Total: ${total}</p>
      </div>
      <Link href="/checkout" className="bg-accent px-4 py-2 inline-block">Finalizar compra</Link>
    </div>
  )
}
