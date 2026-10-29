import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Clock, Info, Mail, MapPin, X } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { PriceTag } from '../components/product/PriceTag'
import { Button } from '../components/ui/Button'
import { company } from '../data/company'
import { useProducts } from '../lib/catalog'
import { usePageTitle } from '../lib/usePageTitle'
import styles from './ContactPage.module.css'

const SUBJECTS = ['Kysymys tuotteesta', 'Tarjouspyyntö', 'Eurowagon-perävaunut', 'Laitteen myynti meille', 'Muu asia']
const EASE = [0.2, 0.75, 0.1, 1] as const

type FormState = { name: string; email: string; phone: string; subject: string; message: string }
type Errors = Partial<Record<keyof FormState, string>>

export function ContactPage() {
  usePageTitle('Yhteystiedot')
  const [params, setParams] = useSearchParams()
  const products = useProducts()
  const product = products.find((p) => String(p.id) === params.get('tuote'))

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    subject: product ? (product.price.kind === 'fixed' ? SUBJECTS[0] : SUBJECTS[1]) : SUBJECTS[0],
    message: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)

  const set = (key: keyof FormState) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const er: Errors = {}
    if (!form.name.trim()) er.name = 'Kirjoita nimesi.'
    if (!form.email.trim() && !form.phone.trim()) er.email = 'Anna sähköposti tai puhelinnumero, jotta voimme vastata.'
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Tarkista sähköpostiosoite.'
    if (form.message.trim().length < 10) er.message = 'Kirjoita viestiin vähintään muutama sana.'
    setErrors(er)
    if (Object.keys(er).length === 0) setSubmitted(true)
    else document.getElementById(`contact-${Object.keys(er)[0]}`)?.focus()
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <p className={`mono ${styles.kicker}`}>Yhteystiedot</p>
        <h1 className={`display ${styles.title}`}>
          Ota yhteyttä<span className={styles.dot}>.</span>
        </h1>
        <p className="lede">
          Nopeimmin tavoitat puhelimitse. Kysy tuotteista, pyydä tarjous tai sovi aika laitteiden katsomiseen
          Joensuussa.
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.details}>
          <a href={company.phone.href} className={styles.phoneCard}>
            <span className="mono">Soita</span>
            <span className={`${styles.phoneNumber} tabular`}>{company.phone.display}</span>
            <ArrowUpRight aria-hidden="true" />
          </a>

          <ul role="list" className={styles.list}>
            <li>
              <Mail aria-hidden="true" />
              <span>
                <span className="mono">Sähköposti</span>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </span>
            </li>
            <li>
              <MapPin aria-hidden="true" />
              <span>
                <span className="mono">Osoite</span>
                <span>
                  {company.address.street}
                  <br />
                  {company.address.postalCode} {company.address.city}
                </span>
                <a href={company.mapsHref} target="_blank" rel="noreferrer" className={styles.mapLink}>
                  Avaa kartalla <ArrowUpRight aria-hidden="true" />
                </a>
              </span>
            </li>
            <li>
              <Clock aria-hidden="true" />
              <span>
                <span className="mono">Aukioloajat</span>
                <span>{company.openingHours}</span>
                <span className={styles.muted}>{company.visitNote}</span>
              </span>
            </li>
          </ul>

          <div className={styles.locator} aria-hidden="true">
            <span className={styles.locatorGrid} />
            <span className={styles.pin} />
            <span className={`mono ${styles.locatorLabel}`}>
              {company.address.city} · {company.address.postalCode}
            </span>
          </div>
        </div>

        <section className={styles.formWrap} aria-labelledby="lomake">
          <h2 id="lomake" className={`headline ${styles.formTitle}`}>
            Lähetä viesti
          </h2>

          <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.div
                key="demo"
                className={styles.demo}
                role="status"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <span className={styles.demoIcon}>
                  <Info aria-hidden="true" />
                </span>
                <p className={`headline ${styles.demoTitle}`}>Esittelyversio — viestiä ei lähetetty.</p>
                <p className={styles.demoText}>
                  Lomake ja sen tarkistukset toimivat, mutta tässä demossa viestejä ei välitetä eikä tallenneta.
                  Valmiissa sivustossa viesti ohjautuu osoitteeseen {company.email}.
                </p>
                <p className={styles.demoText}>
                  Ota sillä välin yhteyttä puhelimitse: <a href={company.phone.href}>{company.phone.display}</a>.
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Takaisin lomakkeeseen
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className={styles.form}
                onSubmit={submit}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {product && (
                  <div className={styles.product}>
                    <span className={styles.productThumb}>
                      {product.images[0] && <img src={product.images[0].thumb} alt="" />}
                    </span>
                    <span className={styles.productInfo}>
                      <span className="mono">Koskee tuotetta · Nro {product.id}</span>
                      <Link to={`/tuote/${product.slug}`} className={styles.productName}>
                        {product.name}
                      </Link>
                      <PriceTag price={product.price} size="sm" />
                    </span>
                    <button
                      type="button"
                      className={styles.productRemove}
                      onClick={() => {
                        params.delete('tuote')
                        setParams(params, { replace: true })
                      }}
                      aria-label="Poista tuoteviittaus"
                    >
                      <X aria-hidden="true" />
                    </button>
                  </div>
                )}

                <div className={styles.row}>
                  <Field id="contact-name" label="Nimi" required error={errors.name}>
                    <input id="contact-name" autoComplete="name" value={form.name} onChange={set('name')} />
                  </Field>
                  <Field id="contact-subject" label="Aihe">
                    <select id="contact-subject" value={form.subject} onChange={set('subject')}>
                      {SUBJECTS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className={styles.row}>
                  <Field id="contact-email" label="Sähköposti" error={errors.email}>
                    <input id="contact-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} />
                  </Field>
                  <Field id="contact-phone" label="Puhelin">
                    <input id="contact-phone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} />
                  </Field>
                </div>
                <Field id="contact-message" label="Viesti" required error={errors.message}>
                  <textarea
                    id="contact-message"
                    rows={6}
                    value={form.message}
                    onChange={set('message')}
                    placeholder={product ? `Hei, olen kiinnostunut tuotteesta ${product.name}…` : 'Mitä etsit?'}
                  />
                </Field>
                <div className={styles.submitRow}>
                  <p className={styles.small}>
                    <span className={styles.demoBadge}>Demo</span> Lomaketta ei lähetetä — tietoja ei tallenneta.
                  </p>
                  <Button type="submit" size="lg">
                    Lähetä viesti
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div className={`${styles.field} ${error ? styles.fieldError : ''}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
