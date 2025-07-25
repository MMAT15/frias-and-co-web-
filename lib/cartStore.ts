import { create } from 'zustand'
import type { Product } from './products'

export interface CartItem extends Product {
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

interface CartState {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string) => void
  clear: () => void
}

export const useCart = create<CartState>((set) => ({
  items: [],
  add: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) =>
          i.id === item.id &&
          i.selectedSize === item.selectedSize &&
          i.selectedColor === item.selectedColor
      )
      if (existing) {
        return {
          items: state.items.map((i) =>
            i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        }
      }
      return { items: [...state.items, item] }
    }),
  remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}))
