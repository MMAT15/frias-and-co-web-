'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline'
import { useCart } from '@/lib/cartStore'

export default function Header() {
  const [open, setOpen] = useState(false)
  const items = useCart((s) => s.items)
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-semibold">
          BERA clothing
        </Link>
        <div className="hidden lg:block text-sm">
          Shop online 24/7 \u2708\ufe0f Env\u00edos a todo el pa\u00eds
        </div>
        <div className="flex items-center gap-4">
          <button className="lg:hidden" onClick={() => setOpen(true)}>
            <Bars3Icon className="w-6 h-6" />
          </button>
          <Link href="/cart" className="relative">
            <ShoppingCartIcon className="w-6 h-6" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>
        </div>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} className="lg:hidden">
        <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
        <Dialog.Panel className="fixed right-0 top-0 h-full w-64 bg-black p-4 space-y-4">
          <button onClick={() => setOpen(false)} className="mb-4">
            <XMarkIcon className="w-6 h-6" />
          </button>
          <Link href="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link href="/products" onClick={() => setOpen(false)}>
            Productos
          </Link>
          <Link href="/contact" onClick={() => setOpen(false)}>
            Contacto
          </Link>
          <Link href="/cart" onClick={() => setOpen(false)}>
            Carrito
          </Link>
          <Link href="/checkout" onClick={() => setOpen(false)}>
            Checkout
          </Link>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}
