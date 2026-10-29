import { use } from 'react'
import { categories } from '../data/categories'
import { products as generatedProducts } from '../data/products.generated'
import type { Category, CategoryId, Product } from '../types/catalog'

/**
 * Catalogue data access layer.
 *
 * Components never import the mock dataset directly — they go through this
 * repository. To connect a real backend (Supabase, WooCommerce, a custom
 * API…), implement `CatalogRepository` with network calls and swap the
 * `catalog` export below. The hooks keep working unchanged because they are
 * built on promises + React's `use()`.
 */
export interface CatalogRepository {
  listProducts(): Promise<Product[]>
  getProduct(slug: string): Promise<Product | undefined>
  listCategories(): Promise<Category[]>
}

type Thenable<T> = Promise<T> & { status?: 'fulfilled'; value?: T }

/**
 * A promise React's `use()` can read synchronously. Local data is available
 * immediately, so marking it fulfilled avoids a needless Suspense fallback.
 */
function resolved<T>(value: T): Promise<T> {
  const promise = Promise.resolve(value) as Thenable<T>
  promise.status = 'fulfilled'
  promise.value = value
  return promise
}

/** Promises must be stable between renders for `use()`; cache per key. */
function memo<T>(fn: (key: string) => Promise<T>) {
  const cache = new Map<string, Promise<T>>()
  return (key: string) => {
    let hit = cache.get(key)
    if (!hit) {
      hit = fn(key)
      cache.set(key, hit)
    }
    return hit
  }
}

/** Generated image paths are root-relative; serve them under the deploy base. */
const withBase = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '')

const products = generatedProducts.map((p) => ({
  ...p,
  images: p.images.map((img) => ({ ...img, src: withBase(img.src), thumb: withBase(img.thumb) })),
}))

const sortedProducts = [...products].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
const bySlug = new Map(products.map((p) => [p.slug, p]))

const localRepository: CatalogRepository = {
  listProducts: () => resolved(sortedProducts),
  getProduct: memo((slug) => resolved(bySlug.get(slug))),
  listCategories: () => resolved(categories),
}

export const catalog: CatalogRepository = localRepository

// --- Hooks -----------------------------------------------------------------

const allProducts = catalog.listProducts()
const allCategories = catalog.listCategories()

export const useProducts = () => use(allProducts)
export const useCategories = () => use(allCategories)
export const useProduct = (slug: string) => use(catalog.getProduct(slug))

/** Products by id, in the given order (missing ids are skipped). */
export function useProductsById(ids: number[]) {
  const all = useProducts()
  return ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Product => Boolean(p))
}

export function useCategory(id: CategoryId | undefined) {
  const list = useCategories()
  return id ? list.find((c) => c.id === id) : undefined
}
