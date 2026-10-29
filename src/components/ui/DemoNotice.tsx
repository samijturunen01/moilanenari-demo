import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './DemoNotice.module.css'

/** Highlighted explanation of what is mock functionality on a page. */
export function DemoNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className={styles.notice} role="note">
      <span className={styles.badge}>Demo</span>
      <div>
        <p className={styles.title}>
          <Info aria-hidden="true" /> {title}
        </p>
        <p className={styles.text}>{children}</p>
      </div>
    </aside>
  )
}
