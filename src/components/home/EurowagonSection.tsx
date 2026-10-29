import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router'
import { useProducts } from '../../lib/catalog'
import { conditionLabels } from '../../lib/format'
import { extractSpecs } from '../../lib/specs'
import { PriceTag } from '../product/PriceTag'
import { ButtonLink } from '../ui/Button'
import { Reveal } from '../ui/Reveal'
import styles from './EurowagonSection.module.css'

export function EurowagonSection() {
  const trailers = useProducts().filter((p) => p.category === 'peravaunut')
  const hero = trailers.find((p) => p.id === 4235) ?? trailers[0]
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const wordX = useTransform(scrollYProgress, [0, 1], ['6%', '-14%'])
  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  if (!hero) return null

  return (
    <section ref={ref} className={`${styles.section} grain`} aria-labelledby="eurowagon">
      <motion.p className={styles.word} style={{ x: wordX }} aria-hidden="true">
        Eurowagon
      </motion.p>

      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <p className={`mono ${styles.kicker}`}>
            <span className={styles.index}>04</span> Kotimaiset perävaunut
          </p>
          <h2 id="eurowagon" className={`headline ${styles.title}`}>
            Eurowagon-tavarankuljetusperävaunut — uusina ja käytettyinä.
          </h2>
          <p className={styles.text}>
            Auton, kelkkojen, mönkijöiden ym. kuljetukseen ja säilytykseen. Perävaunut ovat nähtävillä Joensuussa —
            soita ja sovi näyttö.
          </p>
          <div className={styles.actions}>
            <ButtonLink to="/tuotteet/peravaunut" variant="light" size="lg" icon={<ArrowRight />}>
              Kaikki perävaunut
            </ButtonLink>
          </div>
        </div>

        <Link to={`/tuote/${hero.slug}`} className={styles.media}>
          <motion.img
            src={hero.images[0].src}
            alt={hero.name}
            loading="lazy"
            style={{ y: imageY, scale: 1.14 }}
          />
          <span className={styles.mediaTag}>
            <span>Nro {hero.id}</span>
            <span>{hero.name}</span>
          </span>
        </Link>
      </div>

      <div className="container">
        <ul className={styles.list} role="list">
          {trailers.map((t, i) => {
            const specs = extractSpecs(t, 2)
            return (
              <Reveal as="li" key={t.id} delay={i * 0.06}>
                <Link to={`/tuote/${t.slug}`} className={styles.row}>
                  <span className={styles.thumb}>
                    <img src={t.images[0].thumb} alt="" loading="lazy" />
                  </span>
                  <span className={styles.rowMain}>
                    <span className={styles.rowName}>{t.name}</span>
                    <span className={styles.rowMeta}>
                      {t.condition && <span>{conditionLabels[t.condition]}</span>}
                      {specs.map((s) => (
                        <span key={s.label}>
                          {s.label}: {s.value}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className={styles.rowPrice}>
                    <PriceTag price={t.price} size="md" tone="dark" />
                  </span>
                  <ArrowUpRight aria-hidden="true" className={styles.rowArrow} />
                </Link>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
