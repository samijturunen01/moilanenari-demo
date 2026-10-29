import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, ShoppingBag, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { useCart } from '../../cart/context'
import { company } from '../../data/company'
import { formatEuro } from '../../lib/format'
import { ButtonLink } from '../ui/Button'
import { QuantityStepper } from '../ui/QuantityStepper'
import styles from './CartDrawer.module.css'

const EASE = [0.2, 0.75, 0.1, 1] as const

export function CartDrawer() {
  const { drawer, closeDrawer } = useCart()

  return <AnimatePresence>{drawer.open && <Drawer key="drawer" onClose={closeDrawer} />}</AnimatePresence>
}

function Drawer({ onClose }: { onClose: () => void }) {
  const { lines, subtotal, count, drawer, setQuantity, remove } = useCart()
  const panelRef = useRef<HTMLDivElement>(null)
  const added = drawer.added

  useEffect(() => {
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.root}>
      <motion.div
        className={styles.scrim}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        tabIndex={-1}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className={styles.head}>
          <h2 id="cart-drawer-title" className={styles.title}>
            Ostoskori <span className="mono tabular">({count})</span>
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Sulje ostoskori">
            <X aria-hidden="true" />
          </button>
        </div>

        {added && (
          <motion.div
            className={styles.added}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease: EASE }}
          >
            <span className={styles.addedIcon}>
              <Check aria-hidden="true" />
            </span>
            <span>
              <strong>Lisätty koriin:</strong> {added.name}
            </span>
          </motion.div>
        )}

        {lines.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingBag aria-hidden="true" />
            <p>Ostoskori on tyhjä.</p>
            <Link to="/tuotteet" onClick={onClose} className={styles.emptyLink}>
              Selaa tuotteita <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <ul className={styles.lines} role="list">
            {lines.map((line) => (
              <li key={line.productId} className={styles.line}>
                <Link to={`/tuote/${line.slug}`} onClick={onClose} className={styles.thumb}>
                  {line.image && <img src={line.image} alt="" />}
                </Link>
                <div className={styles.lineBody}>
                  <Link to={`/tuote/${line.slug}`} onClick={onClose} className={styles.lineName}>
                    {line.name}
                  </Link>
                  <span className={`mono ${styles.lineMeta}`}>
                    Nro {line.productId} · {formatEuro(line.unitPrice)} / kpl
                  </span>
                  <div className={styles.lineControls}>
                    <QuantityStepper
                      size="sm"
                      value={line.quantity}
                      max={line.maxQuantity}
                      onChange={(v) => setQuantity(line.productId, v)}
                      label={`Määrä: ${line.name}`}
                    />
                    <button type="button" className={styles.remove} onClick={() => remove(line.productId)}>
                      Poista
                    </button>
                  </div>
                </div>
                <span className={`${styles.lineTotal} tabular`}>{formatEuro(line.unitPrice * line.quantity)}</span>
              </li>
            ))}
          </ul>
        )}

        {lines.length > 0 && (
          <div className={styles.foot}>
            <div className={styles.total}>
              <span>Välisumma</span>
              <span className="tabular">{formatEuro(subtotal)}</span>
            </div>
            <p className={styles.note}>
              {company.vatNote}. Toimitus sovitaan erikseen.
            </p>
            <ButtonLink to="/ostoskori" onClick={onClose} size="lg" block icon={<ArrowRight />}>
              Siirry ostoskoriin
            </ButtonLink>
            <button type="button" className={styles.continue} onClick={onClose}>
              Jatka ostoksia
            </button>
            <p className={styles.demo}>
              <span className={styles.demoBadge}>Demo</span> Ostoskori tallentuu vain tähän selaimeen.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
