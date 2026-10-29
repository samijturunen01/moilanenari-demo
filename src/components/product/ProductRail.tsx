import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Product } from '../../types/catalog'
import { ProductCard } from './ProductCard'
import styles from './ProductRail.module.css'

/** Horizontally scrolling row of product cards with scroll-snap and arrows. */
export function ProductRail({ products, label }: { products: Product[]; label: string }) {
  const ref = useRef<HTMLUListElement>(null)
  const [progress, setProgress] = useState(0)
  const [edges, setEdges] = useState({ start: true, end: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      setProgress(max > 0 ? el.scrollLeft / max : 1)
      setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const scroll = (dir: 1 | -1) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className={styles.rail}>
      <ul ref={ref} className={styles.track} role="list" aria-label={label}>
        {products.map((p) => (
          <li key={p.id} className={styles.item}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
      <div className={`container ${styles.controls}`}>
        <div className={styles.progress} aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} />
        </div>
        <div className={styles.buttons}>
          <button type="button" onClick={() => scroll(-1)} disabled={edges.start} aria-label="Edelliset">
            <ArrowLeft aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scroll(1)} disabled={edges.end} aria-label="Seuraavat">
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
