import type { Product } from '../types/catalog'
import { isPurchasable, maxQuantity } from '../lib/format'

/**
 * DEMO CART — local only. Lines are kept in the browser (localStorage) and
 * are never sent anywhere. A production cart would validate prices and stock
 * on the server; the snapshot fields below exist so the UI can render
 * without a catalogue lookup, which is also how a server cart responds.
 */
export interface CartLine {
  productId: number
  slug: string
  name: string
  unitPrice: number // cents, VAT included
  image?: string
  maxQuantity: number
  quantity: number
}

export type CartAction =
  | { type: 'add'; product: Product; quantity: number }
  | { type: 'set-quantity'; productId: number; quantity: number }
  | { type: 'remove'; productId: number }
  | { type: 'restore'; line: CartLine; index: number }
  | { type: 'clear' }

const clamp = (n: number, max: number) => Math.max(1, Math.min(max, Math.round(n)))

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'add': {
      const { product } = action
      if (!isPurchasable(product) || product.price.kind !== 'fixed') return lines
      const max = maxQuantity(product)
      const existing = lines.find((l) => l.productId === product.id)
      if (existing) {
        return lines.map((l) =>
          l.productId === product.id ? { ...l, quantity: clamp(l.quantity + action.quantity, max) } : l,
        )
      }
      return [
        ...lines,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          unitPrice: product.price.amount,
          image: product.images[0]?.thumb,
          maxQuantity: max,
          quantity: clamp(action.quantity, max),
        },
      ]
    }
    case 'set-quantity':
      return lines.map((l) =>
        l.productId === action.productId ? { ...l, quantity: clamp(action.quantity, l.maxQuantity) } : l,
      )
    case 'remove':
      return lines.filter((l) => l.productId !== action.productId)
    case 'restore': {
      if (lines.some((l) => l.productId === action.line.productId)) return lines
      const next = [...lines]
      next.splice(Math.min(action.index, next.length), 0, action.line)
      return next
    }
    case 'clear':
      return []
  }
}

export const cartTotals = (lines: CartLine[]) => {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  const count = lines.reduce((sum, l) => sum + l.quantity, 0)
  /** VAT share of a VAT-inclusive total, 25,5 % */
  const vat = Math.round(subtotal - subtotal / 1.255)
  return { subtotal, count, vat }
}

const STORAGE_KEY = 'moilanenari-demo-cart-v1'

export function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCart(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // Storage unavailable (private mode) — the cart still works for the session.
  }
}
