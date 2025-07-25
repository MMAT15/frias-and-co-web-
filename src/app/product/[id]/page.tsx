import Image from 'next/image';
import { notFound } from 'next/navigation';

interface Product {
  name: string;
  description: string;
  price: number;
  image: string;
}

const products: Record<string, Product> = {
  '1': {
    name: 'Remera básica',
    description: 'Remera de algodón premium.',
    price: 10000,
    image: '/products/shirt.jpg'
  },
  '2': {
    name: 'Buzo oversize',
    description: 'Buzo con capucha de frisa.',
    price: 20000,
    image: '/products/hoodie.jpg'
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
      <div className="relative w-full h-80">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="mt-2">{product.description}</p>
        <p className="mt-4 text-xl">${product.price}</p>
        <button className="mt-4 bg-black text-white px-4 py-2">Agregar al carrito</button>
      </div>
    </div>
  );
}
