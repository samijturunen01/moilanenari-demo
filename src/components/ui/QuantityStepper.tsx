import { Minus, Plus } from 'lucide-react'
import styles from './QuantityStepper.module.css'

interface Props {
  value: number
  max: number
  onChange: (value: number) => void
  label: string
  size?: 'sm' | 'md'
}

export function QuantityStepper({ value, max, onChange, label, size = 'md' }: Props) {
  return (
    <div className={`${styles.stepper} ${styles[size]}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Vähennä määrää">
        <Minus aria-hidden="true" />
      </button>
      <output className="tabular" aria-live="polite">
        {value}
      </output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Lisää määrää">
        <Plus aria-hidden="true" />
      </button>
    </div>
  )
}
