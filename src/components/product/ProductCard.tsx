import { Check, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useCart } from '../../cart/context'
import { conditionLabels, isNew, isPurchasable } from '../../lib/format'
import type { Product } from '../../types/catalog'
import { PriceTag } from './PriceTag'
import { StockLabel } from './StockLabel'
import styles from './ProductCard.module.css'

interface Props {
  product: Product
  /** Image loading priority — first visible row should be eager */
  eager?: boolean
  size?: 'default' | 'large'
}

export function ProductCard({ product, eager, size = 'default' }: Props) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  const [cover, alt] = product.images
  const href = `/tuote/${product.slug}`
  const soldOut = product.availability.status === 'sold-out'

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1800)
    return () => clearTimeout(t)
  }, [added])

  return (
    <article className={`${styles.card} ${styles[size]} ${soldOut ? styles.soldOut : ''}`}>
      <div className={styles.media}>
        <Link to={href} tabIndex={-1} aria-hidden="true" className={styles.mediaLink}>
          {cover && (
            <img
              className={styles.cover}
              src={size === 'large' ? cover.src : cover.thumb}
              alt=""
              width={cover.width}
              height={cover.height}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
            />
          )}
          {alt && <img className={styles.alt} src={alt.thumb} alt="" loading="lazy" decoding="async" />}
          <span className={styles.crop} />
        </Link>

        <div className={styles.flags}>
          {soldOut ? (
            <span className={styles.flagMuted}>Myyty</span>
          ) : (
            isNew(product) && <span className={styles.flagNew}>Uutuus</span>
          )}
        </div>

        {isPurchasable(product) && (
          <button
            type="button"
            className={`${styles.quickAdd} ${added ? styles.quickAdded : ''}`}
            onClick={() => {
              add(product)
              setAdded(true)
            }}
            aria-label={`Lisää ostoskoriin: ${product.name}`}
          >
            {added ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
            <span className={styles.quickLabel}>{added ? 'Lisätty' : 'Lisää koriin'}</span>
          </button>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.tag}>
          <span>
            Nro {product.id}
            {product.brand && <> · {product.brand}</>}
          </span>
          <StockLabel availability={product.availability} />
        </div>
        <h3 className={styles.title}>
          <Link to={href}>{product.name}</Link>
        </h3>
        <div className={styles.foot}>
          <PriceTag price={product.price} size={size === 'large' ? 'md' : 'sm'} />
          {product.condition && <span className={styles.condition}>{conditionLabels[product.condition]}</span>}
        </div>
      </div>
    </article>
  )
}
