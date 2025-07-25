import products from '../data/products.json'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  sizes: ('XS' | 'S' | 'M' | 'L' | 'XL')[]
  colors: string[]
  images: string[]
}

export default products as Product[]
