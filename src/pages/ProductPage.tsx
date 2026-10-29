import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, Banknote, Check, CircleAlert, MessageSquare, Phone, ShoppingBag, Store, Truck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useCart } from '../cart/context'
import { Gallery } from '../components/product/Gallery'
import { PriceTag } from '../components/product/PriceTag'
import { ProductRail } from '../components/product/ProductRail'
import { StockLabel } from '../components/product/StockLabel'
import { Button, ButtonAnchor, ButtonLink } from '../components/ui/Button'
import { QuantityStepper } from '../components/ui/QuantityStepper'
import { Reveal } from '../components/ui/Reveal'
import { company } from '../data/company'
import { useCategory, useProduct, useProducts } from '../lib/catalog'
import { conditionLabels, formatDate, isPurchasable, maxQuantity } from '../lib/format'
import { extractSpecs } from '../lib/specs'
import { usePageTitle } from '../lib/usePageTitle'
import { NotFoundPage } from './NotFoundPage'
import styles from './ProductPage.module.css'

export function ProductPage() {
  const { slug = '' } = useParams()
  const product = useProduct(slug)
  const category = useCategory(product?.category)
  const all = useProducts()
  const { add, lines } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [buyVisible, setBuyVisible] = useState(true)
  const buyRef = useRef<HTMLDivElement>(null)

  usePageTitle(product?.name ?? 'Tuotetta ei löytynyt')

  // Sticky buy bar (mobile) shows whenever the main buy block is off-screen
  useEffect(() => {
    let frame = 0
    const check = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const r = buyRef.current?.getBoundingClientRect()
        setBuyVisible(!r || (r.bottom > 0 && r.top < window.innerHeight))
      })
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [product])

  useEffect(() => {
    if (!justAdded) return
    const t = setTimeout(() => setJustAdded(false), 2200)
    return () => clearTimeout(t)
  }, [justAdded])

  if (!product) return <NotFoundPage />

  const purchasable = isPurchasable(product)
  const max = maxQuantity(product)
  const inCart = lines.find((l) => l.productId === product.id)?.quantity ?? 0
  const remaining = Math.max(0, max - inCart)
  const specs = extractSpecs(product)
  const related = all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 10)
  const inquiryHref = `/yhteystiedot?tuote=${product.id}`

  const addToCart = () => {
    add(product, quantity)
    setJustAdded(true)
    setQuantity(1)
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <nav aria-label="Murupolku" className={`mono ${styles.crumbs}`}>
          <Link to="/">Etusivu</Link>
          <span aria-hidden="true">/</span>
          <Link to="/tuotteet">Tuotteet</Link>
          {category && (
            <>
              <span aria-hidden="true">/</span>
              <Link to={`/tuotteet/${category.id}`}>{category.name}</Link>
            </>
          )}
        </nav>

        <div className={styles.layout}>
          <div className={styles.galleryCol}>
            <Gallery images={product.images} name={product.name} />
          </div>

          <div className={styles.infoCol}>
            <div className={styles.info}>
              <p className={`mono ${styles.meta}`}>
                <span>Nro {product.id}</span>
                {product.brand && <span>{product.brand}</span>}
                {category && <Link to={`/tuotteet/${category.id}`}>{category.name}</Link>}
              </p>

              <h1 className={`headline ${styles.title}`}>{product.name}</h1>

              <div className={styles.badges}>
                {product.condition && (
                  <span className={styles.condition}>
                    <span className="mono">Kunto</span> {conditionLabels[product.condition]}
                  </span>
                )}
                <StockLabel availability={product.availability} />
              </div>

              {product.conditionNote && (
                <p className={styles.note}>
                  <CircleAlert aria-hidden="true" /> {product.conditionNote}
                </p>
              )}

              <div className={styles.priceBlock}>
                <PriceTag price={product.price} size="lg" />
                <p className={styles.vat}>
                  {product.price.kind === 'from'
                    ? 'Ilmoitus sisältää useita tuotteita — hinnat alkaen. '
                    : product.price.kind === 'quote'
                      ? 'Hinta tarjouksen mukaan. '
                      : ''}
                  {company.vatNote}.
                </p>
              </div>

              <div ref={buyRef} className={styles.buy}>
                {purchasable ? (
                  <>
                    <div className={styles.buyRow}>
                      {max > 1 && (
                        <QuantityStepper
                          value={Math.min(quantity, Math.max(1, remaining))}
                          max={Math.max(1, remaining)}
                          onChange={setQuantity}
                          label="Määrä"
                        />
                      )}
                      <Button
                        size="lg"
                        block
                        variant={justAdded ? 'signal' : 'primary'}
                        onClick={addToCart}
                        disabled={remaining === 0}
                        icon={justAdded ? <Check /> : <ShoppingBag />}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={justAdded ? 'added' : remaining === 0 ? 'max' : 'add'}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {justAdded ? 'Lisätty ostoskoriin' : remaining === 0 ? 'Kaikki korissa' : 'Lisää ostoskoriin'}
                          </motion.span>
                        </AnimatePresence>
                      </Button>
                    </div>
                    {inCart > 0 && (
                      <p className={styles.inCart}>
                        Korissa {inCart} kpl · <Link to="/ostoskori">Siirry ostoskoriin</Link>
                      </p>
                    )}
                    {product.availability.status === 'backorder' && (
                      <p className={styles.inCart}>Tuote toimitetaan jälkitoimituksena.</p>
                    )}
                  </>
                ) : product.availability.status === 'sold-out' ? (
                  <div className={styles.soldOut}>
                    <p>Tämä tuote on myyty. Kysy, onko vastaavaa tulossa.</p>
                    <ButtonLink to={inquiryHref} variant="outline" icon={<ArrowRight />}>
                      Kysy vastaavaa
                    </ButtonLink>
                  </div>
                ) : (
                  <ButtonLink to={inquiryHref} size="lg" block icon={<MessageSquare />}>
                    Pyydä tarjous
                  </ButtonLink>
                )}

                <div className={styles.secondary}>
                  <ButtonAnchor href={company.phone.href} variant="outline" icon={<Phone />} block>
                    Soita {company.phone.display}
                  </ButtonAnchor>
                  {purchasable && (
                    <Link to={inquiryHref} className={styles.ask}>
                      Kysy tuotteesta
                    </Link>
                  )}
                </div>
              </div>

              <ul className={styles.service} role="list">
                <li>
                  <Truck aria-hidden="true" />
                  <span>
                    <strong>Toimitus</strong> sovitaan erikseen
                  </span>
                </li>
                <li>
                  <Store aria-hidden="true" />
                  <span>
                    <strong>Nähtävillä</strong> {company.address.city}, {company.openingHours.toLowerCase()}
                  </span>
                </li>
                <li>
                  <Banknote aria-hidden="true" />
                  <span>
                    <strong>Rahoitus</strong>{' '}
                    <a href={company.financing.href} target="_blank" rel="noreferrer">
                      {company.financing.partner} <ArrowUpRight aria-hidden="true" />
                    </a>
                  </span>
                </li>
              </ul>

              {specs.length > 0 && (
                <dl className={styles.specs}>
                  {specs.map((s) => (
                    <div key={s.label}>
                      <dt className="mono">{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </div>

        <section className={styles.description} aria-labelledby="kuvaus">
          <Reveal className={styles.descHead}>
            <p className="mono">Myyjän kuvaus</p>
            <h2 id="kuvaus" className={`headline ${styles.descTitle}`}>
              Tuotetiedot
            </h2>
            <p className={`mono ${styles.descMeta}`}>Lisätty {formatDate(product.publishedAt)}</p>
          </Reveal>
          <Reveal className={styles.descBody} delay={0.05}>
            {product.description.length === 0 ? (
              <p className={styles.missing}>
                Tuotteelle ei ole vielä kirjoitettu kuvausta. Kysy lisätietoja puhelimitse tai sähköpostilla.
              </p>
            ) : (
              product.description.map((block, i) =>
                block.type === 'p' ? (
                  <p key={i}>{block.text}</p>
                ) : (
                  <ul key={i}>
                    {block.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                ),
              )
            )}
            <p className={styles.source}>
              Kuvaus ja kuvat: alkuperäinen ilmoitus{' '}
              <a href={product.sourceUrl} target="_blank" rel="noreferrer">
                moilanenari.fi <ArrowUpRight aria-hidden="true" />
              </a>
            </p>
          </Reveal>
        </section>
      </div>

      {related.length > 0 && (
        <section className={styles.related} aria-labelledby="samankaltaiset">
          <div className={`container ${styles.relatedHead}`}>
            <h2 id="samankaltaiset" className={`headline ${styles.relatedTitle}`}>
              Samalta osastolta
            </h2>
            {category && (
              <Link to={`/tuotteet/${category.id}`} className={styles.relatedLink}>
                {category.name} <ArrowUpRight aria-hidden="true" />
              </Link>
            )}
          </div>
          <ProductRail products={related} label="Samalta osastolta" />
        </section>
      )}

      {/* Mobile: sticky buy bar once the main button scrolls away */}
      <AnimatePresence>
        {!buyVisible && (
          <motion.div
            className={styles.stickyBar}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.2, 0.75, 0.1, 1] }}
          >
            <div className={styles.stickyInfo}>
              <span className={styles.stickyName}>{product.name}</span>
              <PriceTag price={product.price} size="sm" />
            </div>
            {purchasable ? (
              <Button onClick={addToCart} disabled={remaining === 0} icon={justAdded ? <Check /> : <ShoppingBag />}>
                {justAdded ? 'Lisätty' : 'Koriin'}
              </Button>
            ) : (
              <ButtonLink to={inquiryHref} icon={<MessageSquare />}>
                Kysy
              </ButtonLink>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
