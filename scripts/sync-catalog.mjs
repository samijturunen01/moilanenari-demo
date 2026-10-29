#!/usr/bin/env node
// Builds the local demo catalogue from the public WooCommerce Store API of
// moilanenari.fi. Read-only: it only performs GET requests against the live
// site. Output:
//   src/data/products.generated.ts
//   public/images/products/<id>/<n>.webp  (+ <n>-sm.webp)
//
// Usage: npm run sync-catalog
// Raw responses and original images are cached in scripts/.cache.

import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { brands, categoryOverrides, categoryRules, conditionNotes, nameOverrides } from './curation.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = path.join(ROOT, 'scripts', '.cache')
const IMG_OUT = path.join(ROOT, 'public', 'images', 'products')
const DATA_OUT = path.join(ROOT, 'src', 'data', 'products.generated.ts')
const BASE = 'https://moilanenari.fi'
const MAX_IMAGES = 6

const exists = (p) => access(p).then(() => true, () => false)

async function cachedJson(name, url) {
  const file = path.join(CACHE, name)
  if (await exists(file)) return JSON.parse(await readFile(file, 'utf8'))
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (catalogue demo sync)' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  const json = await res.json()
  await writeFile(file, JSON.stringify(json))
  return json
}

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/å/g, 'a')
    .replace(/×/g, 'x')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// --- Description ---------------------------------------------------------

// "Hinta sis alv. 25,5%", "Hinnat sis.alv 24%", "sis-alv.24%" — VAT is stated once, site-wide
const VAT_SENTENCE = /(hin\w*\.?\s*)?sis[\s.-]*alv[\s.]*[\d,.]*\s*%?/gi
const URL_PATTERN = /https?:\/\/\S+/g

function parseDescription(html) {
  const text = decode(
    html
      .replace(/<\/(p|li|h\d)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
  const lines = text
    .split('\n')
    .flatMap((l) => l.split(/(?=\s-[A-ZÄÖa-zäö])|(?=\s[*•]\s?[A-ZÄÖa-zäö0-9])/)) // inline "-item -item" runs
    .map((l) => l.replace(URL_PATTERN, '').replace(VAT_SENTENCE, '').replace(/\s+/g, ' ').trim())
    .filter((l) => l && !/^[-–—*•.!]+$/.test(l) && !/^lisätiedot$/i.test(l) && !/^tuotetiedot$/i.test(l))

  const blocks = []
  for (const line of lines) {
    const bullet = line.match(/^[-–—*•]\s*(.+)$/)
    const last = blocks.at(-1)
    // Hard-wrapped source text (pasted from brochures): a line starting in
    // lower case continues the previous paragraph or list item.
    if (!bullet && last && /^[a-zäö]/.test(line)) {
      if (last.type === 'p' && !/[.!?:]$/.test(last.text)) {
        last.text += ' ' + line
        continue
      }
      if (last.type === 'list') {
        last.items[last.items.length - 1] += ' ' + line
        continue
      }
    }
    if (bullet) {
      const last = blocks.at(-1)
      if (last?.type === 'list') last.items.push(bullet[1].trim())
      else blocks.push({ type: 'list', items: [bullet[1].trim()] })
    } else {
      blocks.push({ type: 'p', text: line })
    }
  }
  return blocks
}

// --- Facts ---------------------------------------------------------------

function detectCondition(text) {
  const t = text.toLowerCase()
  if (/kuin uu|uutta vastaava|uuttavastaava/.test(t)) return 'kuin-uusi'
  if (/käyttämätön|kättämätön|kaäyttämätön|^uusi\b|^uusia\b|\buusi kotimainen|\buusi !|^uusi ja/.test(t)) return 'uusi'
  if (/vähän käytet|vähänkäytet|vähäisellä käytöllä|vähällä käytöllä/.test(t)) return 'vahan-kaytetty'
  if (/hyväkuntoi|hyvinhuollet/.test(t)) return 'hyvakuntoinen'
  if (/siisti/.test(t)) return 'siisti'
  if (/käyttökuntoi|toimivi?a?t?\b/.test(t)) return 'kayttokuntoinen'
  return undefined
}

function detectPrice(p, descText) {
  const amount = Number(p.prices.price)
  const regular = Number(p.prices.regular_price)
  // "alk." / "alkaen" but not "halk." (halkaisija) or "valk."
  const from = descText.match(/(?<![a-zäö])alk(?:aen|\.)[\s.:]*(\d[\d\s]*)(?:[,.](\d{2}))?\s*€?/i)
  const fromAmount = from ? Number(from[1].replace(/\s/g, '')) * 100 : undefined
  if (amount === 0) return fromAmount ? { kind: 'from', amount: fromAmount } : { kind: 'quote' }
  if (from || /hinnat\s+\d+\s*[-–]\s*\d+/i.test(descText)) {
    return { kind: 'from', amount: fromAmount && fromAmount < amount ? fromAmount : amount }
  }
  return p.on_sale && regular > amount
    ? { kind: 'fixed', amount, regularAmount: regular }
    : { kind: 'fixed', amount }
}

function detectAvailability(p) {
  const text = (p.stock_availability?.text ?? '').toLowerCase()
  if (!p.is_in_stock) return { status: 'sold-out' }
  if (/ei varastossa|jälkitoimituksena/.test(text)) return { status: 'backorder' }
  const qty = text.match(/(\d+)\s*varastossa/)
  return qty ? { status: 'in-stock', quantity: Number(qty[1]) } : { status: 'in-stock' }
}

function detectCategory(p) {
  if (categoryOverrides[p.id]) return categoryOverrides[p.id]
  const names = p.categories.map((c) => decode(c.name))
  for (const [id, list] of categoryRules) if (names.some((n) => list.includes(n))) return id
  return 'muut'
}

function detectBrand(name) {
  const lower = name.toLowerCase()
  return brands.find((b) => lower.includes(b.toLowerCase()))
}

// --- Images --------------------------------------------------------------

function pickSource(img) {
  const candidates = (img.srcset || '')
    .split(',')
    .map((s) => s.trim().split(/\s+/))
    .filter(([u, w]) => u && w)
    .map(([url, w]) => ({ url, width: parseInt(w, 10) }))
    .sort((a, b) => a.width - b.width)
  return (candidates.find((c) => c.width >= 1100) ?? candidates.at(-1))?.url ?? img.src
}

async function processImage(productId, index, img, alt) {
  const dir = path.join(IMG_OUT, String(productId))
  const large = path.join(dir, `${index}.webp`)
  const small = path.join(dir, `${index}-sm.webp`)
  const srcUrl = pickSource(img)
  const cacheFile = path.join(CACHE, 'img', `${productId}-${index}${path.extname(new URL(srcUrl).pathname) || '.jpg'}`)

  if (!(await exists(cacheFile))) {
    const res = await fetch(srcUrl)
    if (!res.ok) throw new Error(`${res.status} ${srcUrl}`)
    await writeFile(cacheFile, Buffer.from(await res.arrayBuffer()))
  }
  await mkdir(dir, { recursive: true })
  const input = sharp(cacheFile).rotate()
  const meta = await input
    .clone()
    .resize({ width: 1100, height: 1400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(large)
  await input
    .clone()
    .resize({ width: 560, height: 720, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 70 })
    .toFile(small)

  return {
    src: `/images/products/${productId}/${index}.webp`,
    thumb: `/images/products/${productId}/${index}-sm.webp`,
    width: meta.width,
    height: meta.height,
    alt,
  }
}

async function pool(items, limit, fn) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const i = next++
        results[i] = await fn(items[i], i)
      }
    }),
  )
  return results
}

// --- Main ----------------------------------------------------------------

await mkdir(path.join(CACHE, 'img'), { recursive: true })
await mkdir(path.dirname(DATA_OUT), { recursive: true })

const raw = [
  ...(await cachedJson('products-1.json', `${BASE}/wp-json/wc/store/v1/products?per_page=100&page=1`)),
  ...(await cachedJson('products-2.json', `${BASE}/wp-json/wc/store/v1/products?per_page=100&page=2`)),
]
const dates = [
  ...(await cachedJson('dates-1.json', `${BASE}/wp-json/wp/v2/product?per_page=100&page=1&_fields=id,date`)),
  ...(await cachedJson('dates-2.json', `${BASE}/wp-json/wp/v2/product?per_page=100&page=2&_fields=id,date`)),
]
const dateById = new Map(dates.map((d) => [d.id, d.date]))
console.log(`Fetched ${raw.length} products`)

const products = await pool(raw, 6, async (p) => {
  const name = nameOverrides[p.id] ?? decode(p.name).replace(/\s+/g, ' ').trim()
  const description = parseDescription(p.description || p.short_description || '')
  const descText = decode((p.description || '').replace(/<[^>]+>/g, ' '))
  const images = []
  for (const [i, img] of p.images.slice(0, MAX_IMAGES).entries()) {
    images.push(await processImage(p.id, i, img, `${name}, kuva ${i + 1}`))
  }
  process.stdout.write('.')
  return {
    id: p.id,
    slug: slugify(name) + '-' + p.id,
    name,
    brand: detectBrand(name),
    category: detectCategory(p),
    condition: conditionNotes[p.id] ? undefined : detectCondition(`${descText} ${decode(p.short_description || '')}`.trim()),
    conditionNote: conditionNotes[p.id],
    price: detectPrice(p, descText),
    availability: detectAvailability(p),
    images,
    description,
    publishedAt: dateById.get(p.id) ?? '2023-01-01T00:00:00',
    sourceUrl: p.permalink,
  }
})

const clean = (o) => JSON.parse(JSON.stringify(o)) // drop undefined keys
const header = `// AUTO-GENERATED by scripts/sync-catalog.mjs — do not edit by hand.
// Source: ${BASE} (WooCommerce Store API), synced ${new Date().toISOString().slice(0, 10)}.
import type { Product } from '../types/catalog'

export const products: Product[] = `
await writeFile(DATA_OUT, header + JSON.stringify(clean(products), null, 2) + '\n')
console.log(`\nWrote ${products.length} products → ${path.relative(ROOT, DATA_OUT)}`)
