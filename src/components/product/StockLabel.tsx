import type { Availability } from '../../types/catalog'
import { availabilityLabel } from '../../lib/format'
import styles from './StockLabel.module.css'

export function StockLabel({ availability, className }: { availability: Availability; className?: string }) {
  return (
    <span className={`${styles.stock} ${styles[availability.status]} ${className ?? ''}`}>
      <span className={styles.dot} aria-hidden="true" />
      {availabilityLabel(availability)}
    </span>
  )
}
