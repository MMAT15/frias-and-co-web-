import Hero from '../components/Hero';
import ProductCarousel from '../components/ProductCarousel';

export default function Home() {
  return (
    <main className="space-y-12 p-4">
      <Hero />
      <section className="max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Nuevos ingresos</h2>
        <ProductCarousel type="new" />
      </section>
    </main>
  );
}
