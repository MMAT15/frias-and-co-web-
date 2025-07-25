import ProductGrid from '@/components/commerce/ProductGrid'

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-semibold">Productos</h1>
      <ProductGrid />
    </div>
  )
}
