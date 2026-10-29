import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useCategories, useProducts } from '../../lib/catalog'
import type { CategoryId } from '../../types/catalog'
import { SectionHead } from './SectionHead'
import styles from './CategoryIndex.module.css'

export function CategoryIndex() {
  const products = useProducts()
  const categories = useCategories()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<CategoryId | null>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 })

  const items = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        count: products.filter((p) => p.category === c.id).length,
        cover: products.find((p) => p.id === c.coverProductId)?.images[0],
      })),
    [categories, products],
  )
  const active = items.find((c) => c.id === hovered)

  return (
    <section className={styles.section} aria-labelledby="osastot">
      <div className="container">
        <SectionHead
          id="osastot"
          index="01"
          kicker="Osastot"
          title={
            <>
              Koko {'ammatti­keittiö'}, <span className={styles.soft}>yhdeksällä osastolla.</span>
            </>
          }
          aside={
            <Link to="/tuotteet" className={styles.allLink}>
              Kaikki {products.length} tuotetta <ArrowUpRight aria-hidden="true" />
            </Link>
          }
        />

        <div
          ref={sectionRef}
          className={styles.listWrap}
          onMouseMove={(e) => {
            const r = sectionRef.current!.getBoundingClientRect()
            x.set(e.clientX - r.left)
            y.set(e.clientY - r.top)
          }}
          onMouseLeave={() => setHovered(null)}
        >
          <ul className={styles.list} role="list">
            {items.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/tuotteet/${c.id}`}
                  className={styles.row}
                  onMouseEnter={() => setHovered(c.id)}
                  onFocus={() => setHovered(c.id)}
                  onBlur={() => setHovered(null)}
                >
                  <span className={styles.index}>{c.index}</span>
                  <span className={styles.name}>{c.name}</span>
                  <span className={styles.desc}>{c.description}</span>
                  <span className={`${styles.count} tabular`}>{c.count}</span>
                  <ArrowUpRight aria-hidden="true" className={styles.arrow} />
                </Link>
              </li>
            ))}
          </ul>

          <motion.div className={styles.preview} style={{ x: sx, y: sy }} aria-hidden="true">
            <AnimatePresence>
              {active?.cover && (
                <motion.div
                  key={active.id}
                  className={styles.previewInner}
                  initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, ease: [0.2, 0.75, 0.1, 1] }}
                >
                  <img src={active.cover.thumb} alt="" />
                  <span className={styles.previewTag}>
                    {active.index} · {active.count} kpl
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Touch layout: swipeable tiles */}
      <ul className={styles.tiles} role="list">
        {items.map((c) => (
          <li key={c.id}>
            <Link to={`/tuotteet/${c.id}`} className={styles.tile}>
              <span className={styles.tileImage}>{c.cover && <img src={c.cover.thumb} alt="" loading="lazy" />}</span>
              <span className={styles.tileMeta}>
                <span className="mono">{c.index}</span>
                <span className="mono tabular">{c.count} kpl</span>
              </span>
              <span className={styles.tileName}>{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
