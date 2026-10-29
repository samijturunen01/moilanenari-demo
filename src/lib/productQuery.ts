import { categories } from '../data/categories'
import type { CategoryId, Condition, Product } from '../types/catalog'
import { normalize, sortPrice } from './format'

/**
 * Pure search / filter / sort over a product list. Runs client-side on the
 * mock dataset; with a real backend the same `ProductQuery` maps to API
 * query parameters.
 */
export type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name'

export interface ProductQuery {
  q: string
  category?: CategoryId
  brands: string[]
  conditions: Condition[]
  minPrice?: number // euros
  maxPrice?: number // euros
  inStock: boolean
  onSale: boolean
  sort: SortKey
}

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Uusimmat' },
  { value: 'price-asc', label: 'Halvimmat' },
  { value: 'price-desc', label: 'Kalleimmat' },
  { value: 'name', label: 'Nimi A–Ö' },
]

const categoryName = new Map(categories.map((c) => [c.id, c.name]))

const searchIndex = new WeakMap<Product, string>()
function haystack(p: Product) {
  let text = searchIndex.get(p)
  if (!text) {
    const description = p.description.map((b) => (b.type === 'p' ? b.text : b.items.join(' '))).join(' ')
    text = normalize(`${p.name} ${p.brand ?? ''} ${categoryName.get(p.category)} ${p.id} ${description}`)
    searchIndex.set(p, text)
  }
  return text
}

/** Every search word must appear; matches in the name rank first. */
export function searchProducts(list: Product[], q: string) {
  const terms = normalize(q).split(/\s+/).filter(Boolean)
  if (!terms.length) return list
  return list
    .filter((p) => terms.every((t) => haystack(p).includes(t)))
    .map((p) => ({ p, score: terms.filter((t) => normalize(p.name).includes(t)).length }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p)
}

/** Applies everything except the category — used for category counts. */
function applyFacets(list: Product[], query: ProductQuery, skip?: 'category') {
  return list.filter((p) => {
    if (skip !== 'category' && query.category && p.category !== query.category) return false
    if (query.brands.length && (!p.brand || !query.brands.includes(p.brand))) return false
    if (query.conditions.length && (!p.condition || !query.conditions.includes(p.condition))) return false
    if (query.inStock && p.availability.status === 'sold-out') return false
    if (query.onSale && !(p.price.kind === 'fixed' && p.price.regularAmount)) return false
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      if (p.price.kind === 'quote') return false
      const euros = p.price.amount / 100
      if (query.minPrice !== undefined && euros < query.minPrice) return false
      if (query.maxPrice !== undefined && euros > query.maxPrice) return false
    }
    return true
  })
}

export function runQuery(all: Product[], query: ProductQuery) {
  const searched = searchProducts(all, query.q)
  const withoutCategory = applyFacets(searched, query, 'category')
  const results = query.category ? withoutCategory.filter((p) => p.category === query.category) : withoutCategory

  const sorted =
    query.sort === 'newest' && query.q
      ? results // keep relevance order while searching
      : [...results].sort((a, b) => {
          switch (query.sort) {
            case 'price-asc':
              return sortPrice(a.price) - sortPrice(b.price)
            case 'price-desc':
              return sortPrice(b.price) - sortPrice(a.price)
            case 'name':
              return a.name.localeCompare(b.name, 'fi')
            default:
              return b.publishedAt.localeCompare(a.publishedAt)
          }
        })

  const categoryCounts = new Map<CategoryId, number>()
  for (const p of withoutCategory) categoryCounts.set(p.category, (categoryCounts.get(p.category) ?? 0) + 1)

  return { results: sorted, categoryCounts, totalWithoutCategory: withoutCategory.length }
}

// --- URL <-> query -----------------------------------------------------------

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : [])
const num = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined)

export function queryFromParams(params: URLSearchParams, category?: CategoryId): ProductQuery {
  return {
    q: params.get('q') ?? '',
    category,
    brands: list(params.get('merkki')),
    conditions: list(params.get('kunto')) as Condition[],
    minPrice: num(params.get('min')),
    maxPrice: num(params.get('max')),
    inStock: params.get('varastossa') === '1',
    onSale: params.get('tarjous') === '1',
    sort: (params.get('jarjestys') as SortKey) || 'newest',
  }
}

export function paramsFromQuery(q: ProductQuery) {
  const params = new URLSearchParams()
  if (q.q) params.set('q', q.q)
  if (q.brands.length) params.set('merkki', q.brands.join(','))
  if (q.conditions.length) params.set('kunto', q.conditions.join(','))
  if (q.minPrice !== undefined) params.set('min', String(q.minPrice))
  if (q.maxPrice !== undefined) params.set('max', String(q.maxPrice))
  if (q.inStock) params.set('varastossa', '1')
  if (q.onSale) params.set('tarjous', '1')
  if (q.sort !== 'newest') params.set('jarjestys', q.sort)
  return params
}

export function activeFilterCount(q: ProductQuery) {
  return (
    q.brands.length +
    q.conditions.length +
    (q.minPrice !== undefined || q.maxPrice !== undefined ? 1 : 0) +
    (q.inStock ? 1 : 0) +
    (q.onSale ? 1 : 0)
  )
}
