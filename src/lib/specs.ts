import type { Product } from '../types/catalog'

/**
 * Picks key facts out of the seller's free-text description by keyword.
 * Nothing is inferred: if the description does not mention it, it is not shown.
 */
const KEYS: { label: string; pattern: RegExp }[] = [
  { label: 'Sisämitat', pattern: /sisämitat\s*:?\s*(.+)/i },
  { label: 'Korin pituus', pattern: /korin pituus\s*(.+)/i },
  { label: 'Kokonaispaino', pattern: /kok(?:\.|onais)\s*paino\s*:?\s*(.+)/i },
  { label: 'Ulkomitat', pattern: /ulkomitat(?:\s*:\s*|\s+)(.+)/i },
  { label: 'Mitat', pattern: /^mitat(?:\s*:\s*|\s+)(.+)/i },
  { label: 'Sähköliitäntä', pattern: /sähköliitäntä(?:\s*:\s*|\s+)(.+)/i },
  { label: 'Teho', pattern: /^teho(?:\s*:\s*|\s+)(.+)/i },
  { label: 'Kapasiteetti', pattern: /^kapasiteetti(?:\s*:\s*|\s+)(.+)/i },
  { label: 'Rekisteröity', pattern: /rekisteröity\s*(.+)/i },
  { label: 'Katsastettu', pattern: /^katsastettu\s*(.+)/i },
  { label: 'Käyttöönotto', pattern: /käyttöönottovuosi\s*(.+)/i },
  { label: 'Käyttötunnit', pattern: /käyttötunnit\s*(.+)/i },
]

export interface Spec {
  label: string
  value: string
}

function lines(p: Product) {
  return p.description.flatMap((b) => (b.type === 'p' ? b.text.split(/(?<=\.)\s+(?=[A-ZÄÖ])/) : b.items))
}

export function extractSpecs(p: Product, limit = 6): Spec[] {
  const found: Spec[] = []
  const text = lines(p)
  for (const { label, pattern } of KEYS) {
    for (const line of text) {
      const m = line.trim().match(pattern)
      if (m) {
        const value = m[1]
          .replace(/^[:\s-]+/, '')
          .replace(/^(?:\([^)]*\)\s*:?\s*)+/, '') // "(PxLxK) (mm) 2120x…", "(L x S x K): …"
          .replace(/\s*[.!]+$/, '')
          .trim()
        if (value && value.length < 90) found.push({ label, value })
        break
      }
    }
    if (found.length >= limit) break
  }
  return found
}
