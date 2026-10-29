import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Phone, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { FilterPanel } from '../components/catalog/FilterPanel'
import { ProductCard } from '../components/product/ProductCard'
import { Button, ButtonAnchor } from '../components/ui/Button'
import { company } from '../data/company'
import { useCategories, useCategory, useProducts } from '../lib/catalog'
import { conditionLabels } from '../lib/format'
import {
  activeFilterCount,
  paramsFromQuery,
  queryFromParams,
  runQuery,
  sortOptions,
  type ProductQuery,
  type SortKey,
} from '../lib/productQuery'
import { usePageTitle } from '../lib/usePageTitle'
import type { CategoryId } from '../types/catalog'
import { NotFoundPage } from './NotFoundPage'
import styles from './CatalogPage.module.css'

const PAGE = 24
const EASE = [0.2, 0.75, 0.1, 1] as const

export function CatalogPage() {
  const { category: categoryParam } = useParams()
  const categories = useCategories()
  const validCategory = categories.some((c) => c.id === categoryParam)
  const category = useCategory(validCategory ? (categoryParam as CategoryId) : undefined)
  const all = useProducts()
  const [params, setParams] = useSearchParams()
  const query = useMemo(() => queryFromParams(params, category?.id), [params, category])
  const [visible, setVisible] = useState(PAGE)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [searchText, setSearchText] = useState(query.q)

  usePageTitle(category?.name ?? (query.q ? `Haku: ${query.q}` : 'Tuotteet'))

  const { results, categoryCounts, totalWithoutCategory } = useMemo(() => runQuery(all, query), [all, query])
  const brandPool = useMemo(() => runQuery(all, { ...query, brands: [] }).results, [all, query])
  const conditionPool = useMemo(() => runQuery(all, { ...query, conditions: [] }).results, [all, query])
  const filters = activeFilterCount(query)

  // Reset paging whenever the result set changes
  const signature = params.toString() + (category?.id ?? '')
  const [lastSignature, setLastSignature] = useState(signature)
  if (signature !== lastSignature) {
    setLastSignature(signature)
    setVisible(PAGE)
    setSearchText(query.q)
  }

  useEffect(() => {
    if (!sheetOpen) return
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheetOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [sheetOpen])

  if (categoryParam && !validCategory) return <NotFoundPage />

  const update = (patch: Partial<ProductQuery>) => setParams(paramsFromQuery({ ...query, ...patch }), { replace: true })
  const clearFilters = () =>
    update({ brands: [], conditions: [], minPrice: undefined, maxPrice: undefined, inStock: false, onSale: false })
  const categoryHref = (id?: CategoryId) => {
    const qs = params.toString()
    return `/tuotteet${id ? `/${id}` : ''}${qs ? `?${qs}` : ''}`
  }

  const chips: { label: string; remove: () => void }[] = [
    ...query.brands.map((b) => ({ label: b, remove: () => update({ brands: query.brands.filter((x) => x !== b) }) })),
    ...query.conditions.map((c) => ({
      label: conditionLabels[c],
      remove: () => update({ conditions: query.conditions.filter((x) => x !== c) }),
    })),
    ...(query.minPrice !== undefined || query.maxPrice !== undefined
      ? [
          {
            label: `${query.minPrice ?? 0}–${query.maxPrice ?? '∞'} €`,
            remove: () => update({ minPrice: undefined, maxPrice: undefined }),
          },
        ]
      : []),
    ...(query.inStock ? [{ label: 'Saatavilla', remove: () => update({ inStock: false }) }] : []),
    ...(query.onSale ? [{ label: 'Tarjoukset', remove: () => update({ onSale: false }) }] : []),
  ]

  const panel = (
    <FilterPanel
      query={query}
      brandPool={brandPool}
      conditionPool={conditionPool}
      categoryCounts={categoryCounts}
      total={totalWithoutCategory}
      onChange={update}
      categoryHref={categoryHref}
    />
  )

  return (
    <div className={styles.page}>
      <header className={`container ${styles.head}`}>
        <nav aria-label="Murupolku" className={`mono ${styles.crumbs}`}>
          <Link to="/">Etusivu</Link>
          <span aria-hidden="true">/</span>
          {category ? <Link to="/tuotteet">Tuotteet</Link> : <span aria-current="page">Tuotteet</span>}
          {category && (
            <>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{category.name}</span>
            </>
          )}
        </nav>
        <div className={styles.titleRow}>
          <h1 className={`display ${styles.title}`}>
            {category && <span className={styles.titleIndex}>{category.index}</span>}
            {category?.name ?? 'Kaikki tuotteet'}
          </h1>
          <p className={styles.count}>
            <span className="tabular">{results.length}</span>
            <span className="mono">{results.length === 1 ? 'tuote' : 'tuotetta'}</span>
          </p>
        </div>
        {category && <p className={`lede ${styles.lede}`}>{category.description}</p>}

        {/* Department pills — primary navigation on touch screens */}
        <div className={styles.pills} role="list">
          <Link role="listitem" to={categoryHref()} className={`${styles.pill} ${!category ? styles.pillActive : ''}`}>
            Kaikki
          </Link>
          {categories.map((c) => (
            <Link
              role="listitem"
              key={c.id}
              to={categoryHref(c.id)}
              className={`${styles.pill} ${category?.id === c.id ? styles.pillActive : ''}`}
            >
              {c.name} <span className="tabular">{categoryCounts.get(c.id) ?? 0}</span>
            </Link>
          ))}
        </div>
      </header>

      <div className={`container ${styles.layout}`}>
        <aside className={styles.sidebar} aria-label="Suodattimet">
          {panel}
        </aside>

        <section className={styles.main} aria-label="Tuotelistaus">
          <div className={styles.toolbar}>
            <form
              className={styles.search}
              role="search"
              onSubmit={(e) => {
                e.preventDefault()
                update({ q: searchText.trim() })
              }}
            >
              <Search aria-hidden="true" />
              <label htmlFor="catalog-search" className="visually-hidden">
                Hae tuotteista
              </label>
              <input
                id="catalog-search"
                type="search"
                placeholder={category ? `Hae osastosta ${category.name.toLowerCase()}` : 'Hae tuotteista'}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value)
                  update({ q: e.target.value })
                }}
              />
              {searchText && (
                <button
                  type="button"
                  aria-label="Tyhjennä haku"
                  onClick={() => {
                    setSearchText('')
                    update({ q: '' })
                  }}
                >
                  <X aria-hidden="true" />
                </button>
              )}
            </form>

            <button type="button" className={styles.filterButton} onClick={() => setSheetOpen(true)}>
              <SlidersHorizontal aria-hidden="true" /> Suodata
              {filters > 0 && <span className={`${styles.filterCount} tabular`}>{filters}</span>}
            </button>

            <label className={styles.sort}>
              <span className="visually-hidden">Järjestys</span>
              <select value={query.sort} onChange={(e) => update({ sort: e.target.value as SortKey })}>
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" />
            </label>
          </div>

          {(chips.length > 0 || query.q) && (
            <div className={styles.chips}>
              {query.q && (
                <span className={styles.searchNote}>
                  Haku: <strong>“{query.q}”</strong>
                </span>
              )}
              {chips.map((c) => (
                <button key={c.label} type="button" className={styles.chip} onClick={c.remove}>
                  {c.label} <X aria-hidden="true" />
                  <span className="visually-hidden">— poista suodatin</span>
                </button>
              ))}
              {chips.length > 1 && (
                <button type="button" className={styles.clear} onClick={clearFilters}>
                  Tyhjennä kaikki
                </button>
              )}
            </div>
          )}

          {results.length === 0 ? (
            <div className={styles.empty}>
              <p className={`headline ${styles.emptyTitle}`}>Ei osumia näillä ehdoilla.</p>
              <p className={styles.emptyText}>
                Varasto vaihtuu jatkuvasti, eikä kaikkea ole verkossa. Kysy suoraan — usein löytyy.
              </p>
              <div className={styles.emptyActions}>
                {(filters > 0 || query.q) && (
                  <Button variant="outline" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                    Poista rajaukset
                  </Button>
                )}
                <ButtonAnchor href={company.phone.href} icon={<Phone />}>
                  {company.phone.display}
                </ButtonAnchor>
              </div>
            </div>
          ) : (
            <>
              <ul className={styles.grid} role="list">
                <AnimatePresence mode="popLayout" initial={false}>
                  {results.slice(0, visible).map((p, i) => (
                    <motion.li
                      key={p.id}
                      layout="position"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.4, ease: EASE, delay: i >= visible - PAGE ? (i % PAGE) * 0.02 : 0 }}
                    >
                      <ProductCard product={p} eager={i < 6} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              <div className={styles.pager}>
                <p className="mono">
                  Näytetään {Math.min(visible, results.length)} / {results.length}
                </p>
                <div className={styles.pagerBar} aria-hidden="true">
                  <span style={{ transform: `scaleX(${Math.min(1, visible / results.length)})` }} />
                </div>
                {visible < results.length && (
                  <Button variant="outline" onClick={() => setVisible((v) => v + PAGE)}>
                    Näytä lisää tuotteita
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <div className={styles.sheetRoot}>
            <motion.div
              className={styles.scrim}
              onClick={() => setSheetOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className={styles.sheet}
              role="dialog"
              aria-modal="true"
              aria-label="Suodattimet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <div className={styles.sheetHead}>
                <span className={styles.sheetGrip} aria-hidden="true" />
                <h2 className={styles.sheetTitle}>Suodata tuotteita</h2>
                <button type="button" onClick={() => setSheetOpen(false)} aria-label="Sulje suodattimet">
                  <X aria-hidden="true" />
                </button>
              </div>
              <div className={styles.sheetBody}>{panel}</div>
              <div className={styles.sheetFoot}>
                {filters > 0 && (
                  <button type="button" className={styles.clear} onClick={clearFilters}>
                    Tyhjennä
                  </button>
                )}
                <Button block size="lg" onClick={() => setSheetOpen(false)}>
                  Näytä {results.length} tuotetta
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
