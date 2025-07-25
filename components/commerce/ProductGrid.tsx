import products from '@/lib/products'
import ProductCard from './ProductCard'

export default function ProductGrid({
  limit,
  items: itemsProp,
}: {
  limit?: number
  items?: typeof products
}) {
  const items = itemsProp || (limit ? products.slice(0, limit) : products)
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
