import Image from 'next/image';
import { notFound } from 'next/navigation';

interface Product {
  name: string;
  price: number;
  image: string;
  description: string;
}

const products: Record<string, Product> = {
  '1': {
    name: 'Remera básica',
    price: 10000,
    image: '/products/shirt.jpg',
    description: 'Remera de algodón premium.'
  }
};

export interface ProductPageProps {
  params: { id: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = products[params.id];

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto grid gap-6 p-4 md:grid-cols-2">
      <div className="relative h-80 w-full">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="mt-2">{product.description}</p>
        <p className="mt-4 text-xl">${product.price}</p>
        <button className="mt-4 bg-black px-4 py-2 text-white">Agregar al carrito</button>
      </div>
    </div>
  );
}
