import { Link } from 'react-router'
import { useProducts } from '../../lib/catalog'
import { formatEuro } from '../../lib/format'
import type { Product } from '../../types/catalog'
import styles from './Ticker.module.css'

const priceText = (p: Product) =>
  p.price.kind === 'quote' ? 'Kysy hintaa' : `${p.price.kind === 'from' ? 'alk. ' : ''}${formatEuro(p.price.amount)}`

/** Endless band of the latest arrivals. Duplicated once for a seamless loop. */
export function Ticker() {
  const latest = useProducts()
    .filter((p) => p.availability.status !== 'sold-out')
    .slice(0, 12)

  const items = (hidden: boolean) =>
    latest.map((p) => (
      <li key={`${hidden}-${p.id}`} aria-hidden={hidden || undefined}>
        <Link to={`/tuote/${p.slug}`} tabIndex={hidden ? -1 : undefined} className={styles.item}>
          <span className={styles.no}>Nro {p.id}</span>
          <span className={styles.name}>{p.name}</span>
          <span className={`${styles.price} tabular`}>{priceText(p)}</span>
        </Link>
      </li>
    ))

  return (
    <section className={styles.ticker} aria-label="Viimeksi lisätyt">
      <span className={styles.label}>
        <span className={styles.dot} aria-hidden="true" />
        Uusimmat
      </span>
      <div className={styles.viewport}>
        <ul className={styles.track} role="list">
          {items(false)}
          {items(true)}
        </ul>
      </div>
    </section>
  )
}
