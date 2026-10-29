import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import styles from './Button.module.css'

type Variant = 'primary' | 'signal' | 'outline' | 'outline-light' | 'light'
type Size = 'md' | 'lg'

interface Common {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  /** Stretch to the container width */
  block?: boolean
}

const cls = ({ variant = 'primary', size = 'md', block }: Common, extra?: string) =>
  [styles.button, styles[variant], styles[size], block && styles.block, extra].filter(Boolean).join(' ')

function Inner({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <>
      <span className={styles.label}>{children}</span>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
    </>
  )
}

export function Button({ variant, size, icon, block, className, children, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cls({ variant, size, block }, className)} {...rest}>
      <Inner icon={icon}>{children}</Inner>
    </button>
  )
}

export function ButtonLink({ variant, size, icon, block, className, children, ...rest }: Common & LinkProps) {
  return (
    <Link className={cls({ variant, size, block }, className)} {...rest}>
      <Inner icon={icon}>{children}</Inner>
    </Link>
  )
}

export function ButtonAnchor({ variant, size, icon, block, className, children, ...rest }: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cls({ variant, size, block }, className)} {...rest}>
      <Inner icon={icon}>{children}</Inner>
    </a>
  )
}
