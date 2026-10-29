import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/** Fades content up as it enters the viewport. Honours reduced motion via <MotionConfig>. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.75, ease: [0.2, 0.75, 0.1, 1], delay }}
    >
      {children}
    </Tag>
  )
}
