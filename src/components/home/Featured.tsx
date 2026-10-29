import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { merchandising } from '../../data/merchandising'
import { useProductsById } from '../../lib/catalog'
import { ProductCard } from '../product/ProductCard'
import { Reveal } from '../ui/Reveal'
import { SectionHead } from './SectionHead'
import styles from './Featured.module.css'

export function Featured() {
  const [lead, ...rest] = useProductsById(merchandising.featured)

  return (
    <section className={styles.section} aria-labelledby="poiminnat">
      <div className="container">
        <SectionHead
          id="poiminnat"
          index="02"
          kicker="Poimintoja varastosta"
          title={
            <>
              Tunnettuja merkkejä, <span className={styles.soft}>käytettyinä.</span>
            </>
          }
          aside={
            <Link to="/tuotteet?tarjous=1" className={styles.link}>
              Kaikki tarjoukset <ArrowUpRight aria-hidden="true" />
            </Link>
          }
        />
        <div className={styles.grid}>
          <Reveal className={styles.lead}>
            <ProductCard product={lead} size="large" />
          </Reveal>
          {rest.map((p, i) => (
            <Reveal key={p.id} delay={0.06 * (i + 1)}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
