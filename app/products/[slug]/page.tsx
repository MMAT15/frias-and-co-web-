'use client'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import products, { Product } from '@/lib/products'
import { useCart } from '@/lib/cartStore'

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = (products as Product[]).find((p) => p.slug === params.slug)
  if (!product) return notFound()

  const [size, setSize] = useState(product.sizes[0])
  const [color, setColor] = useState(product.colors[0])
  const [qty, setQty] = useState(1)

  const add = () =>
    useCart
      .getState()
      .add({
        ...product,
        quantity: qty,
        selectedSize: size,
        selectedColor: color,
      })

  return (
    <div className="max-w-4xl mx-auto p-4 grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        {product.images.map((src) => (
          <div key={src} className="relative w-full h-80">
            <Image src={src} alt={product.name} fill className="object-cover" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p>${product.price}</p>
        <div className="space-y-2">
          <div>
            <p className="mb-1">Talle</p>
            <div className="flex gap-2">
              {product.sizes.map((s) => (
                <label key={s} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    checked={size === s}
                    onChange={() => setSize(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1">Color</p>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  className={`w-6 h-6 border rounded-full ${
                    color === c ? 'ring-2 ring-accent' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-2 border"
              onClick={() => setQty(Math.max(1, qty - 1))}
            >
              -
            </button>
            <span>{qty}</span>
            <button className="px-2 border" onClick={() => setQty(qty + 1)}>
              +
            </button>
          </div>
        </div>
        <button className="bg-accent px-4 py-2" onClick={add}>
          Añadir al carrito
        </button>
        <details className="prose max-w-none" open>
          <summary className="cursor-pointer">Descripción</summary>
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </details>
        <details className="prose max-w-none">
          <summary className="cursor-pointer">Envíos & devoluciones</summary>
          <p>Envíos gratis a todo el país. Tenés 30 días para cambios.</p>
        </details>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}
