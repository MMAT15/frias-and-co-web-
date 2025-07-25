import Link from 'next/link';
import Image from 'next/image';

const products = [
  {
    id: '1',
    name: 'Remera básica',
    price: 10000,
    image: '/products/shirt.jpg'
  }
];

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((p) => (
        <Link key={p.id} href={`/product/${p.id}`} className="border p-2">
          <div className="relative w-full h-48">
            <Image src={p.image} alt={p.name} fill className="object-cover" />
          </div>
          <h3 className="mt-2 text-sm font-medium">{p.name}</h3>
          <p className="text-sm">${p.price}</p>
        </Link>
      ))}
    </div>
  );
}
