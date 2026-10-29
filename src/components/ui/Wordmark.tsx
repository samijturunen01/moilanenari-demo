import styles from './Wordmark.module.css'

/** The existing "MOILANEN | ARI.FI" logotype, redrawn in type. */
export function Wordmark({ tone = 'ink', size = 'md' }: { tone?: 'ink' | 'paper'; size?: 'md' | 'xl' }) {
  return (
    <span className={`${styles.mark} ${styles[tone]} ${styles[size]}`} aria-label="Moilanen Ari.fi">
      <span className={styles.first} aria-hidden="true">
        Moilanen
      </span>
      <span className={styles.box} aria-hidden="true">
        Ari<span className={styles.dot}>.</span>fi
      </span>
    </span>
  )
}
