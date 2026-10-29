/**
 * Catalogue domain model.
 *
 * These types describe the data the UI consumes. They are deliberately
 * independent of WooCommerce / Supabase / any future backend: a real API
 * adapter only has to map its response into these shapes.
 */

export type CategoryId =
  | 'kypsennys'
  | 'kylmalaitteet'
  | 'jakelu'
  | 'rst-kalusteet'
  | 'esikasittely'
  | 'kahvi'
  | 'astianpesu'
  | 'peravaunut'
  | 'muut'

export interface Category {
  id: CategoryId
  /** Display name, e.g. "Uunit ja liedet" */
  name: string
  /** One-line description used in menus and category headers */
  description: string
  /** Running number shown in the catalogue index ("01") */
  index: string
  /** Product whose photo represents the department in menus */
  coverProductId: number
}

/**
 * Condition as stated by the seller in the original listing.
 * Undefined when the listing does not state a condition — never guessed.
 */
export type Condition =
  | 'uusi'
  | 'kuin-uusi'
  | 'vahan-kaytetty'
  | 'hyvakuntoinen'
  | 'siisti'
  | 'kayttokuntoinen'

/** All amounts are in euro cents, VAT included. */
export type Price =
  | { kind: 'fixed'; amount: number; regularAmount?: number }
  /** Listing covers several items, "hinnat alkaen" */
  | { kind: 'from'; amount: number }
  /** No price published — sold by request for quotation */
  | { kind: 'quote' }

export type Availability =
  | { status: 'in-stock'; quantity?: number }
  | { status: 'backorder' }
  | { status: 'sold-out' }

export interface ProductImage {
  /** Large image (~1100px) for the gallery */
  src: string
  /** Small image (~560px) for cards and thumbnails */
  thumb: string
  width: number
  height: number
  alt: string
}

export type DescriptionBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }

export interface Product {
  id: number
  slug: string
  name: string
  brand?: string
  category: CategoryId
  condition?: Condition
  /** Seller-reported caveat, shown prominently (e.g. a known fault) */
  conditionNote?: string
  price: Price
  availability: Availability
  images: ProductImage[]
  /** Seller's original description, split into paragraphs and lists */
  description: DescriptionBlock[]
  /** ISO date the listing was published */
  publishedAt: string
  /** Original listing on the current website */
  sourceUrl: string
}
