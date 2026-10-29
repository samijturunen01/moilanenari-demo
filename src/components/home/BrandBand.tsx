import { Link } from 'react-router'
import { useProducts } from '../../lib/catalog'
import { SectionHead } from './SectionHead'
import styles from './BrandBand.module.css'

/** Brands currently in stock, sized by how many listings they have. */
export function BrandBand() {
  const products = useProducts()
  const counts = new Map<string, number>()
  for (const p of products) if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1)
  const brands = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14)

  return (
    <section className={styles.section} aria-labelledby="merkit">
      <div className="container">
        <SectionHead id="merkit" index="05" kicker="Merkit varastossa" title={'Ammatti­keittiöiden tutut nimet.'} />
        <ul className={styles.list} role="list">
          {brands.map(([brand, count]) => (
            <li key={brand}>
              <Link
                to={`/tuotteet?merkki=${encodeURIComponent(brand)}`}
                className={`${styles.brand} ${count >= 10 ? styles.xl : count >= 3 ? styles.lg : ''}`}
              >
                {brand}
                <sup className="tabular">{count}</sup>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
