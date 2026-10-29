import styles from './DemoBar.module.css'

/** Persistent notice: this is a design prototype, not an operational store. */
export function DemoBar() {
  return (
    <div className={styles.bar} role="note">
      <span className={styles.badge}>Demo</span>
      <span className={styles.text}>
        Esittelyversio uudesta verkkokaupasta. <span className={styles.more}>Tilauksia ei välitetä eikä tietoja tallenneta.</span>
      </span>
    </div>
  )
}
