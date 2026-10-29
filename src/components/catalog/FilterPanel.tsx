import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useCategories } from '../../lib/catalog'
import { conditionLabels } from '../../lib/format'
import type { ProductQuery } from '../../lib/productQuery'
import type { CategoryId, Condition, Product } from '../../types/catalog'
import styles from './FilterPanel.module.css'

const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: 'Alle 300 €', max: 300 },
  { label: '300–1 000 €', min: 300, max: 1000 },
  { label: '1 000–5 000 €', min: 1000, max: 5000 },
  { label: 'Yli 5 000 €', min: 5000 },
]

interface Props {
  query: ProductQuery
  /** Matches for every filter except brand — used for brand counts */
  brandPool: Product[]
  /** Matches for every filter except condition */
  conditionPool: Product[]
  categoryCounts: Map<CategoryId, number>
  total: number
  onChange: (patch: Partial<ProductQuery>) => void
  categoryHref: (id?: CategoryId) => string
}

export function FilterPanel({ query, brandPool, conditionPool, categoryCounts, total, onChange, categoryHref }: Props) {
  const categories = useCategories()
  const [showAllBrands, setShowAllBrands] = useState(false)

  const brands = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of brandPool) if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1)
    for (const b of query.brands) if (!counts.has(b)) counts.set(b, 0)
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fi'))
  }, [brandPool, query.brands])

  const conditions = useMemo(() => {
    const counts = new Map<Condition, number>()
    for (const p of conditionPool) if (p.condition) counts.set(p.condition, (counts.get(p.condition) ?? 0) + 1)
    return (Object.keys(conditionLabels) as Condition[]).map((c) => [c, counts.get(c) ?? 0] as const)
  }, [conditionPool])

  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  const visibleBrands = showAllBrands ? brands : brands.slice(0, 7)

  return (
    <div className={styles.panel}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Osasto</legend>
        <ul role="list" className={styles.cats}>
          <li>
            <Link to={categoryHref()} className={`${styles.cat} ${!query.category ? styles.catActive : ''}`}>
              <span>Kaikki osastot</span>
              <span className="tabular">{total}</span>
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                to={categoryHref(c.id)}
                className={`${styles.cat} ${query.category === c.id ? styles.catActive : ''}`}
                aria-current={query.category === c.id ? 'page' : undefined}
              >
                <span>{c.name}</span>
                <span className="tabular">{categoryCounts.get(c.id) ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Saatavuus ja hinta</legend>
        <Toggle label="Vain saatavilla olevat" checked={query.inStock} onChange={(v) => onChange({ inStock: v })} />
        <Toggle label="Vain tarjoukset" checked={query.onSale} onChange={(v) => onChange({ onSale: v })} />
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Hinta</legend>
        <div className={styles.priceInputs}>
          <label>
            <span className="visually-hidden">Vähimmäishinta euroina</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Min €"
              value={query.minPrice ?? ''}
              onChange={(e) => onChange({ minPrice: e.target.value === '' ? undefined : Number(e.target.value) })}
            />
          </label>
          <span aria-hidden="true">–</span>
          <label>
            <span className="visually-hidden">Enimmäishinta euroina</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Max €"
              value={query.maxPrice ?? ''}
              onChange={(e) => onChange({ maxPrice: e.target.value === '' ? undefined : Number(e.target.value) })}
            />
          </label>
        </div>
        <div className={styles.presets}>
          {PRICE_PRESETS.map((p) => {
            const active = query.minPrice === p.min && query.maxPrice === p.max
            return (
              <button
                key={p.label}
                type="button"
                aria-pressed={active}
                className={`${styles.preset} ${active ? styles.presetActive : ''}`}
                onClick={() => onChange(active ? { minPrice: undefined, maxPrice: undefined } : { minPrice: p.min, maxPrice: p.max })}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Merkki</legend>
        {visibleBrands.map(([brand, count]) => (
          <Checkbox
            key={brand}
            label={brand}
            count={count}
            checked={query.brands.includes(brand)}
            onChange={() => onChange({ brands: toggle(query.brands, brand) })}
          />
        ))}
        {brands.length > 7 && (
          <button type="button" className={styles.more} onClick={() => setShowAllBrands((v) => !v)}>
            {showAllBrands ? 'Näytä vähemmän' : `Näytä kaikki ${brands.length} merkkiä`}
          </button>
        )}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Kunto (myyjän ilmoittama)</legend>
        {conditions.map(([c, count]) => (
          <Checkbox
            key={c}
            label={conditionLabels[c]}
            count={count}
            checked={query.conditions.includes(c)}
            onChange={() => onChange({ conditions: toggle(query.conditions, c) })}
          />
        ))}
      </fieldset>
    </div>
  )
}

function Checkbox({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  return (
    <label className={`${styles.check} ${count === 0 && !checked ? styles.checkEmpty : ''}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className={styles.box} aria-hidden="true">
        <Check />
      </span>
      <span className={styles.checkLabel}>{label}</span>
      <span className={`${styles.checkCount} tabular`}>{count}</span>
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={styles.toggle}>
      <span>{label}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.switch} aria-hidden="true" />
    </label>
  )
}
