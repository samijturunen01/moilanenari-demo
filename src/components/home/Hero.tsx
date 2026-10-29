import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Phone } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { company } from '../../data/company'
import { merchandising } from '../../data/merchandising'
import { useProducts, useProductsById } from '../../lib/catalog'
import { formatDate } from '../../lib/format'
import { PriceTag } from '../product/PriceTag'
import { ButtonAnchor, ButtonLink } from '../ui/Button'
import styles from './Hero.module.css'

const EASE = [0.2, 0.75, 0.1, 1] as const
const YEAR = new Date().getFullYear()

function Line({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <span className={styles.line}>
      <motion.span
        className={styles.lineInner}
        initial={{ y: '105%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}

export function Hero() {
  const all = useProducts()
  const specimens = useProductsById(merchandising.hero)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotion()
  const current = specimens[index]
  const inStock = all.filter((p) => p.availability.status !== 'sold-out').length
  const next = () => setIndex((i) => (i + 1) % specimens.length)

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <motion.p
            className={`mono ${styles.eyebrow}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className={styles.pulse} aria-hidden="true" />
            Joensuu — käytetyt ravintola- ja suurkeittiölaitteet
          </motion.p>

          <h1 id="hero-title" className={`display ${styles.title}`}>
            <Line delay={0.05}>Raskas kalusto.</Line>
            <Line delay={0.15}>
              <span className={styles.titleSoft}>Kevyempi hinta</span>
              <span className={styles.dot}>.</span>
            </Line>
          </h1>

          <motion.p
            className={`lede ${styles.lede}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
          >
            Runsas valikoima käytettyjä ravintola- ja suurkeittiölaitteita: uuneja, liesiä, rst-kalusteita, yleiskoneita
            ja kylmälaitteita. Lisäksi kotimaiset Eurowagon-perävaunut.
          </motion.p>

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
          >
            <ButtonLink to="/tuotteet" size="lg" icon={<ArrowRight />}>
              Selaa varastoa
            </ButtonLink>
            <ButtonAnchor href={company.phone.href} size="lg" variant="outline" icon={<Phone />}>
              {company.phone.display}
            </ButtonAnchor>
          </motion.div>
        </div>

        {current && (
          <motion.div
            className={styles.specimen}
            initial={{ opacity: 0, clipPath: 'inset(8% 0 8% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0% 0 0% 0)' }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <span className={styles.vertical} aria-hidden="true">
              Varastoluettelo · {YEAR} · Joensuu
            </span>

            <Link to={`/tuote/${current.slug}`} className={styles.frame} aria-label={current.name}>
              <AnimatePresence initial={false}>
                <motion.img
                  key={current.id}
                  src={current.images[0].src}
                  alt=""
                  className={styles.frameImage}
                  initial={{ clipPath: 'inset(0 0 0 100%)', scale: 1.08 }}
                  animate={{ clipPath: 'inset(0 0 0 0%)', scale: 1 }}
                  exit={{ opacity: 0.6 }}
                  transition={{ duration: 0.9, ease: EASE }}
                />
              </AnimatePresence>
              <span className={styles.marks} aria-hidden="true" />
            </Link>

            <div className={styles.caption}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  className={styles.captionInner}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <span className={`mono ${styles.captionMeta}`}>
                    {String(index + 1).padStart(2, '0')} / {String(specimens.length).padStart(2, '0')} — Nro {current.id}
                  </span>
                  <Link to={`/tuote/${current.slug}`} className={styles.captionName}>
                    {current.name}
                  </Link>
                  <PriceTag price={current.price} size="sm" />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className={styles.segments} role="tablist" aria-label="Esittelyssä olevat tuotteet">
              {specimens.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={p.name}
                  className={styles.segment}
                  onClick={() => setIndex(i)}
                >
                  <span
                    className={`${styles.segmentFill} ${i < index ? styles.segmentDone : ''} ${
                      i === index && !reduced ? styles.segmentActive : ''
                    } ${paused ? styles.segmentPaused : ''}`}
                    onAnimationEnd={i === index ? next : undefined}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="container">
        <dl className={styles.facts}>
          <div>
            <dt className="mono">Varastossa nyt</dt>
            <dd className="tabular">{inStock} tuotetta</dd>
          </div>
          <div>
            <dt className="mono">Uusin lisäys</dt>
            <dd className="tabular">{formatDate(all[0].publishedAt)}</dd>
          </div>
          <div>
            <dt className="mono">Toimitus</dt>
            <dd>Sovitaan erikseen</dd>
          </div>
          <div>
            <dt className="mono">Rahoitus</dt>
            <dd>
              <a href={company.financing.href} target="_blank" rel="noreferrer">
                {company.financing.partner}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
