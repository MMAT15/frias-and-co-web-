import HeroSlider from '@/components/commerce/HeroSlider'
import ProductGrid from '@/components/commerce/ProductGrid'
import Newsletter from '@/components/commerce/Newsletter'

export default function Home() {
  return (
    <div className="space-y-16">
      <HeroSlider />
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4">Nuevos ingresos</h2>
        <ProductGrid limit={6} />
      </section>
      <Newsletter />
    </div>
  )
}
