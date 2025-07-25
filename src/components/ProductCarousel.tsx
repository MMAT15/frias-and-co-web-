import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Remera básica',
    price: 10000,
    image: '/products/shirt.jpg'
  }
];

export default function ProductCarousel({ type }: { type: string }) {
  return (
    <div className="flex overflow-x-auto gap-4 snap-x">
      {products.map((p) => (
        <Link
          href={`/product/${p.id}`}
          key={p.id}
          className="min-w-[200px] snap-start"
        >
          <div className="relative h-48 w-48">
            <Image src={p.image} alt={p.name} fill className="object-cover" />
          </div>
          <h3 className="mt-2 text-sm font-medium">{p.name}</h3>
          <p className="text-sm">${p.price}</p>
        </Link>
      ))}
    </div>
  );
}
