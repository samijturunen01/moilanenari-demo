import type { ReactNode } from 'react'
import { Reveal } from '../ui/Reveal'
import styles from './SectionHead.module.css'

/** Editorial section header: running number, kicker and a large title. */
export function SectionHead({
  index,
  kicker,
  title,
  aside,
  tone = 'ink',
  id,
}: {
  index: string
  kicker: string
  title: ReactNode
  aside?: ReactNode
  tone?: 'ink' | 'paper'
  id?: string
}) {
  return (
    <Reveal className={`${styles.head} ${styles[tone]}`}>
      <p className={`mono ${styles.kicker}`}>
        <span className={styles.index}>{index}</span>
        <span className={styles.rule} aria-hidden="true" />
        {kicker}
      </p>
      <div className={styles.row}>
        <h2 id={id} className={`headline ${styles.title}`}>
          {title}
        </h2>
        {aside && <div className={styles.aside}>{aside}</div>}
      </div>
    </Reveal>
  )
}
