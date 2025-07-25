import Image from 'next/image';
import { notFound } from 'next/navigation';

const products = {
  '1': {
    name: 'Remera básica',
    price: 10000,
    image: '/products/shirt.jpg',
    description: 'Remera de algodón premium.'
  }
};

export default function ProductPage({ params }: { params: { id: string } }) {
const product = products[params.id as keyof typeof products];
  if (!product) return notFound();
  return (
    <div className="max-w-4xl mx-auto p-4 grid md:grid-cols-2 gap-6">
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
