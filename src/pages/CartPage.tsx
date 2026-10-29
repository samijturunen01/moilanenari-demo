import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Trash2, Undo2 } from 'lucide-react'
import { Link } from 'react-router'
import { useCart } from '../cart/context'
import { ProductCard } from '../components/product/ProductCard'
import { ButtonLink } from '../components/ui/Button'
import { DemoNotice } from '../components/ui/DemoNotice'
import { QuantityStepper } from '../components/ui/QuantityStepper'
import { company } from '../data/company'
import { merchandising } from '../data/merchandising'
import { useProductsById } from '../lib/catalog'
import { formatEuro } from '../lib/format'
import { usePageTitle } from '../lib/usePageTitle'
import styles from './CartPage.module.css'

const EASE = [0.2, 0.75, 0.1, 1] as const

export function CartPage() {
  usePageTitle('Ostoskori')
  const { lines, subtotal, vat, count, setQuantity, remove, lastRemoved, undoRemove } = useCart()
  const suggestions = useProductsById(merchandising.featured).slice(0, 4)

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <p className="mono">
          <Link to="/tuotteet" className={styles.back}>
            <ArrowLeft aria-hidden="true" /> Jatka ostoksia
          </Link>
        </p>
        <h1 className={`display ${styles.title}`}>
          Ostoskori <sup className="tabular">{count}</sup>
        </h1>
      </header>

      <DemoNotice title="Esittelyversion ostoskori">
        Ostoskori toimii vain tässä selaimessa, eikä sen sisältöä lähetetä mihinkään. Verkkotilaukset otetaan käyttöön
        valmiissa verkkokaupassa.
      </DemoNotice>

      {lines.length === 0 ? (
        <section className={styles.empty}>
          <p className={`headline ${styles.emptyTitle}`}>Ostoskori on tyhjä.</p>
          <p className={styles.emptyText}>Aloita esimerkiksi näistä poiminnoista varastosta.</p>
          <ul className={styles.suggest} role="list">
            {suggestions.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className={styles.layout}>
          <section aria-label="Tuotteet ostoskorissa">
            <div className={`mono ${styles.tableHead}`} aria-hidden="true">
              <span>Tuote</span>
              <span>Määrä</span>
              <span>Yhteensä</span>
            </div>
            <ul role="list" className={styles.lines}>
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <motion.li
                    key={line.productId}
                    className={styles.line}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <Link to={`/tuote/${line.slug}`} className={styles.thumb}>
                      {line.image && <img src={line.image} alt="" />}
                    </Link>
                    <div className={styles.lineInfo}>
                      <span className={`mono ${styles.lineMeta}`}>Nro {line.productId}</span>
                      <Link to={`/tuote/${line.slug}`} className={styles.lineName}>
                        {line.name}
                      </Link>
                      <span className={styles.unit}>
                        {formatEuro(line.unitPrice)} / kpl
                        {line.maxQuantity > 1 && <> · varastossa {line.maxQuantity} kpl</>}
                      </span>
                    </div>
                    <div className={styles.qty}>
                      <QuantityStepper
                        value={line.quantity}
                        max={line.maxQuantity}
                        onChange={(v) => setQuantity(line.productId, v)}
                        label={`Määrä: ${line.name}`}
                        size="sm"
                      />
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={() => remove(line.productId)}
                        aria-label={`Poista ${line.name}`}
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    </div>
                    <span className={`${styles.lineTotal} tabular`}>{formatEuro(line.unitPrice * line.quantity)}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </section>

          <aside className={styles.summary} aria-label="Yhteenveto">
            <h2 className={styles.summaryTitle}>Yhteenveto</h2>
            <dl className={styles.rows}>
              <div>
                <dt>Tuotteet ({count} kpl)</dt>
                <dd className="tabular">{formatEuro(subtotal)}</dd>
              </div>
              <div>
                <dt>Toimitus</dt>
                <dd>Sovitaan erikseen</dd>
              </div>
              <div className={styles.total}>
                <dt>Yhteensä</dt>
                <dd className="tabular">{formatEuro(subtotal)}</dd>
              </div>
              <div className={styles.vatRow}>
                <dt>Sisältää ALV 25,5 %</dt>
                <dd className="tabular">{formatEuro(vat)}</dd>
              </div>
            </dl>
            <ButtonLink to="/kassa" size="lg" block icon={<ArrowRight />}>
              Jatka kassalle
            </ButtonLink>
            <p className={styles.help}>
              Kysyttävää? Soita <a href={company.phone.href}>{company.phone.display}</a>
            </p>
          </aside>
        </div>
      )}

      <AnimatePresence>
        {lastRemoved && (
          <motion.div
            className={styles.toast}
            role="status"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <span>
              Poistettu: <strong>{lastRemoved.name}</strong>
            </span>
            <button
              type="button"
              onClick={undoRemove}
            >
              <Undo2 aria-hidden="true" /> Kumoa
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
