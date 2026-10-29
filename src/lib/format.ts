import type { Availability, Condition, Price, Product } from '../types/catalog'

const euro = new Intl.NumberFormat('fi-FI', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** 395000 → "3 950 €", 990 → "9,90 €" */
export function formatEuro(cents: number) {
  return euro.format(cents / 100)
}

export const conditionLabels: Record<Condition, string> = {
  uusi: 'Uusi, käyttämätön',
  'kuin-uusi': 'Kuin uusi',
  'vahan-kaytetty': 'Vähän käytetty',
  hyvakuntoinen: 'Hyväkuntoinen',
  siisti: 'Siisti',
  kayttokuntoinen: 'Käyttökuntoinen',
}

/** Short label for the inventory tag on cards. */
export function availabilityLabel(a: Availability) {
  switch (a.status) {
    case 'in-stock':
      return a.quantity ? `${a.quantity} kpl varastossa` : 'Varastossa'
    case 'backorder':
      return 'Jälkitoimitus'
    case 'sold-out':
      return 'Myyty'
  }
}

export function discountPercent(price: Price) {
  if (price.kind !== 'fixed' || !price.regularAmount) return undefined
  return Math.round((1 - price.amount / price.regularAmount) * 100)
}

/** Unit price used for sorting; quote-only items sort last. */
export function sortPrice(price: Price) {
  return price.kind === 'quote' ? Number.POSITIVE_INFINITY : price.amount
}

/** Only single items with a fixed price can go into the cart. */
export function isPurchasable(p: Product) {
  return p.price.kind === 'fixed' && p.availability.status !== 'sold-out'
}

export function maxQuantity(p: Product) {
  return p.availability.status === 'in-stock' && p.availability.quantity ? p.availability.quantity : 1
}

/** Listings published within the last 60 days are flagged as new. */
export function isNew(p: Product, now = Date.now()) {
  return now - new Date(p.publishedAt).getTime() < 60 * 24 * 3600 * 1000
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

/** Search-friendly text: lower case, no diacritics. */
export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}
