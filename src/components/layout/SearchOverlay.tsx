import { motion } from 'motion/react'
import { ArrowRight, Search, X } from 'lucide-react'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useCategories, useProducts } from '../../lib/catalog'
import { normalize } from '../../lib/format'
import { searchProducts } from '../../lib/productQuery'
import { PriceTag } from '../product/PriceTag'
import styles from './SearchOverlay.module.css'

const SUGGESTIONS = ['Metos', 'yhdistelmäuuni', 'yleiskone', 'lämpöhaude', 'rst-pöytä', 'kahvinkeitin']
const EASE = [0.2, 0.75, 0.1, 1] as const

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const deferred = useDeferredValue(q)
  const products = useProducts()
  const categories = useCategories()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => (deferred.trim() ? searchProducts(products, deferred) : []), [products, deferred])
  const matchingCategories = useMemo(() => {
    const t = normalize(deferred.trim())
    return t ? categories.filter((c) => normalize(c.name).includes(t)) : []
  }, [categories, deferred])

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [onClose])

  const submit = (term: string) => {
    onClose()
    navigate(`/tuotteet?q=${encodeURIComponent(term.trim())}`)
  }

  return (
    <motion.div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Tuotehaku"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className={styles.panel}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -16, opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <div className="container">
          <form
            className={styles.form}
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              if (q.trim()) submit(q)
            }}
          >
            <Search aria-hidden="true" className={styles.searchIcon} />
            <label htmlFor="global-search" className="visually-hidden">
              Hae tuotteita
            </label>
            <input
              ref={inputRef}
              id="global-search"
              className={styles.input}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Mitä etsit? Esim. uuni, Metos, rst-pöytä"
              autoComplete="off"
              enterKeyHint="search"
            />
            <button type="button" className={styles.close} onClick={onClose} aria-label="Sulje haku">
              <X aria-hidden="true" />
            </button>
          </form>

          <div className={styles.body} aria-live="polite">
            {!q.trim() && (
              <div className={styles.suggest}>
                <p className="mono">Suosittuja hakuja</p>
                <div className={styles.chips}>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" className={styles.chip} onClick={() => setQ(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {q.trim() && (
              <>
                {matchingCategories.length > 0 && (
                  <div className={styles.cats}>
                    {matchingCategories.map((c) => (
                      <Link key={c.id} to={`/tuotteet/${c.id}`} className={styles.catLink} onClick={onClose}>
                        <span className="mono">Osasto {c.index}</span> {c.name} <ArrowRight aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                )}
                <p className={`mono ${styles.count}`}>
                  {results.length ? `${results.length} osumaa` : 'Ei osumia — kokeile toista hakusanaa tai soita meille.'}
                </p>
                <ul className={styles.results} role="list">
                  {results.slice(0, 6).map((p) => (
                    <li key={p.id}>
                      <Link to={`/tuote/${p.slug}`} className={styles.result} onClick={onClose}>
                        <span className={styles.thumb}>{p.images[0] && <img src={p.images[0].thumb} alt="" />}</span>
                        <span className={styles.resultText}>
                          <span className="mono">Nro {p.id}</span>
                          <span className={styles.resultName}>{p.name}</span>
                        </span>
                        <PriceTag price={p.price} size="sm" />
                      </Link>
                    </li>
                  ))}
                </ul>
                {results.length > 6 && (
                  <button type="button" className={styles.all} onClick={() => submit(q)}>
                    Näytä kaikki {results.length} tulosta <ArrowRight aria-hidden="true" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
