import Image from 'next/image'
import { notFound } from 'next/navigation'
import products, { Product } from '@/lib/products'
import { useCart } from '@/lib/cartStore'

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = (products as Product[]).find((p) => p.slug === params.slug)
  if (!product) return notFound()
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
        <button
          className="bg-accent px-4 py-2"
          onClick={() =>
            useCart.getState().add({ ...product, quantity: 1 })
          }
        >
          Añadir al carrito
        </button>
        <p className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
      </div>
    </div>
  )
}
