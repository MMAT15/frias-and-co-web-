import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative h-64 sm:h-96 w-full overflow-hidden rounded-lg">
      <Image src="/hero.jpg" alt="Campaña" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white p-4">
        <h1 className="text-3xl font-bold">Nueva temporada</h1>
        <p className="mt-2 max-w-md">Descubrí las últimas tendencias en indumentaria urbana.</p>
        <div className="mt-4 flex gap-2">
          <Link href="/products" className="bg-white text-black px-4 py-2 text-sm font-semibold rounded">Comprar ahora</Link>
          <Link href="/offers" className="border border-white px-4 py-2 text-sm rounded">Ver ofertas</Link>
        </div>
      </div>
    </div>
  );
}
