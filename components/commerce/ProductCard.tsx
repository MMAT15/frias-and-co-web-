import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/products'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border p-2">
      <Link href={`/products/${product.slug}`} className="block space-y-2">
        <div className="relative w-full h-60 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-sm">${product.price}</p>
      </Link>
    </div>
  )
}
