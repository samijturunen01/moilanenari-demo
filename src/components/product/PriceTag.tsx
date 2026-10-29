import type { Price } from '../../types/catalog'
import { discountPercent, formatEuro } from '../../lib/format'
import styles from './PriceTag.module.css'

export function PriceTag({
  price,
  size = 'md',
  tone = 'light',
}: {
  price: Price
  size?: 'sm' | 'md' | 'lg'
  tone?: 'light' | 'dark'
}) {
  const discount = discountPercent(price)

  return (
    <div className={`${styles.price} ${styles[size]} ${tone === 'dark' ? styles.dark : ''}`}>
      {price.kind === 'quote' ? (
        <span className={styles.quote}>Kysy hintaa</span>
      ) : (
        <>
          {price.kind === 'from' && <span className={styles.prefix}>alk.</span>}
          <span className={`${styles.amount} tabular`}>{formatEuro(price.amount)}</span>
          {price.kind === 'fixed' && price.regularAmount && (
            <span className={styles.was}>
              <span className="visually-hidden">Normaalihinta </span>
              <s className="tabular">{formatEuro(price.regularAmount)}</s>
              <span className={styles.badge}>−{discount} %</span>
            </span>
          )}
        </>
      )}
    </div>
  )
}
