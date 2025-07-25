'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import ProductGrid from '@/components/commerce/ProductGrid'
import products from '@/lib/products'

export default function ProductsPage() {
  const router = useRouter()
  const params = useSearchParams()

  const size = params.get('size') as 'XS' | 'S' | 'M' | 'L' | 'XL' | null
  const color = params.get('color')
  const min = params.get('min') ? Number(params.get('min')) : null
  const max = params.get('max') ? Number(params.get('max')) : null

  const filtered = products.filter((p) => {
    const matchesSize = size ? p.sizes.includes(size) : true
    const matchesColor = color ? p.colors.includes(color) : true
    const matchesMin = min ? p.price >= min : true
    const matchesMax = max ? p.price <= max : true
    return matchesSize && matchesColor && matchesMin && matchesMax
  })

  const updateParam = (key: string, value: string) => {
    const sp = new URLSearchParams(params.toString())
    if (value) sp.set(key, value)
    else sp.delete(key)
    router.push(`/products?${sp.toString()}`)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-semibold">Productos</h1>
      <form className="flex flex-wrap gap-2 text-black">
        <select
          className="px-2 py-1"
          value={size || ''}
          onChange={(e) => updateParam('size', e.target.value)}
        >
          <option value="">Talle</option>
          <option value="XS">XS</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
        </select>
        <input
          type="color"
          value={color || '#000000'}
          onChange={(e) => updateParam('color', e.target.value)}
        />
        <input
          type="number"
          placeholder="Min $"
          className="px-2 py-1 w-24"
          value={min ?? ''}
          onChange={(e) => updateParam('min', e.target.value)}
        />
        <input
          type="number"
          placeholder="Max $"
          className="px-2 py-1 w-24"
          value={max ?? ''}
          onChange={(e) => updateParam('max', e.target.value)}
        />
      </form>
      <ProductGrid items={filtered} />
    </div>
  )
}
