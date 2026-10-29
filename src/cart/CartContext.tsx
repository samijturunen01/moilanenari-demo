import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import type { Product } from '../types/catalog'
import { cartReducer, cartTotals, loadCart, saveCart, type CartLine } from './cart'
import { CartContext, type CartContextValue } from './context'

const UNDO_WINDOW_MS = 5000

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, undefined, loadCart)
  const [drawer, setDrawer] = useState<{ open: boolean; added?: Product }>({ open: false })
  const [lastRemoved, setLastRemoved] = useState<{ line: CartLine; index: number }>()
  const undoTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => saveCart(lines), [lines])
  useEffect(() => () => clearTimeout(undoTimer.current), [])

  const add = useCallback((product: Product, quantity = 1) => {
    dispatch({ type: 'add', product, quantity })
    setDrawer({ open: true, added: product })
  }, [])

  const remove = useCallback(
    (productId: number) => {
      const index = lines.findIndex((l) => l.productId === productId)
      if (index >= 0) {
        setLastRemoved({ line: lines[index], index })
        clearTimeout(undoTimer.current)
        undoTimer.current = setTimeout(() => setLastRemoved(undefined), UNDO_WINDOW_MS)
      }
      dispatch({ type: 'remove', productId })
    },
    [lines],
  )

  const undoRemove = useCallback(() => {
    clearTimeout(undoTimer.current)
    if (lastRemoved) dispatch({ type: 'restore', ...lastRemoved })
    setLastRemoved(undefined)
  }, [lastRemoved])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ...cartTotals(lines),
      add,
      setQuantity: (productId, quantity) => dispatch({ type: 'set-quantity', productId, quantity }),
      remove,
      undoRemove,
      lastRemoved: lastRemoved?.line,
      clear: () => dispatch({ type: 'clear' }),
      drawer,
      closeDrawer: () => setDrawer((d) => ({ ...d, open: false })),
      openDrawer: () => setDrawer({ open: true }),
    }),
    [lines, add, remove, undoRemove, lastRemoved, drawer],
  )

  return <CartContext value={value}>{children}</CartContext>
}
