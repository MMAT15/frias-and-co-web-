export function productLD({ id, name, description, price, image }: { id: string; name: string; description: string; price: number; image: string }) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name,
    image,
    description,
    sku: id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ARS',
      price,
      availability: 'https://schema.org/InStock'
    }
  };
}
