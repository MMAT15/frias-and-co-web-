import products from '@/lib/products'
import ProductCard from './ProductCard'

export default function ProductGrid({ limit }: { limit?: number }) {
  const items = limit ? products.slice(0, limit) : products
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
