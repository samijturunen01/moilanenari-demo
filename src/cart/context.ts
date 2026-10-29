import { createContext, useContext } from 'react'
import type { Product } from '../types/catalog'
import type { CartLine } from './cart'

export interface CartContextValue {
  lines: CartLine[]
  subtotal: number
  vat: number
  count: number
  add: (product: Product, quantity?: number) => void
  setQuantity: (productId: number, quantity: number) => void
  remove: (productId: number) => void
  undoRemove: () => void
  /** Most recently removed line; cleared automatically after a few seconds */
  lastRemoved?: CartLine
  clear: () => void
  /** The drawer that slides in after "Lisää koriin" */
  drawer: { open: boolean; added?: Product }
  closeDrawer: () => void
  openDrawer: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
