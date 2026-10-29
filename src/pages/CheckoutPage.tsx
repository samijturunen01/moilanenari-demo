import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Banknote, Check, CreditCard, Info, Lock, Phone, Store, Truck } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useCart } from '../cart/context'
import { Button, ButtonAnchor, ButtonLink } from '../components/ui/Button'
import { DemoNotice } from '../components/ui/DemoNotice'
import { company } from '../data/company'
import { formatEuro } from '../lib/format'
import { usePageTitle } from '../lib/usePageTitle'
import styles from './CheckoutPage.module.css'

/**
 * CHECKOUT CONCEPT — visual demonstration only.
 * Nothing typed here is stored or sent, no payment details are requested and
 * the final step never reports a successful order.
 */
const STEPS = ['Yhteystiedot', 'Toimitus', 'Maksutapa', 'Vahvistus'] as const
const EASE = [0.2, 0.75, 0.1, 1] as const

type Delivery = 'nouto' | 'sovittava'
type Payment = 'verkkomaksu' | 'rahoitus'

const deliveryLabels: Record<Delivery, string> = {
  nouto: `Nouto, ${company.address.city}`,
  sovittava: 'Toimitus sovitaan erikseen',
}
const paymentLabels: Record<Payment, string> = {
  verkkomaksu: 'Verkkopankki tai kortti',
  rahoitus: `Rahoitus (${company.financing.partner})`,
}

export function CheckoutPage() {
  usePageTitle('Kassa')
  const { lines, subtotal, vat, count } = useCart()
  const [step, setStep] = useState(0)
  const [contact, setContact] = useState({ name: '', company: '', email: '', phone: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof contact, string>>>({})
  const [delivery, setDelivery] = useState<Delivery>('nouto')
  const [payment, setPayment] = useState<Payment>('verkkomaksu')
  const [demoModal, setDemoModal] = useState(false)

  if (lines.length === 0) {
    return (
      <div className={`container ${styles.emptyPage}`}>
        <h1 className={`display ${styles.title}`}>Kassa</h1>
        <p className="lede">Ostoskorisi on tyhjä, joten kassalle ei ole vielä mitään vietävää.</p>
        <ButtonLink to="/tuotteet" icon={<ArrowRight />}>
          Selaa tuotteita
        </ButtonLink>
      </div>
    )
  }

  const validateContact = () => {
    const e: typeof errors = {}
    if (!contact.name.trim()) e.name = 'Kirjoita nimesi.'
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) e.email = 'Tarkista sähköpostiosoite.'
    if (contact.phone.replace(/\D/g, '').length < 6) e.phone = 'Tarkista puhelinnumero.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = (e?: FormEvent) => {
    e?.preventDefault()
    if (step === 0 && !validateContact()) return
    setStep((s) => Math.min(STEPS.length - 1, s + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <Link to="/ostoskori" className={`mono ${styles.back}`}>
          <ArrowLeft aria-hidden="true" /> Takaisin ostoskoriin
        </Link>
        <h1 className={`display ${styles.title}`}>Kassa</h1>
        <ol className={styles.stepper} aria-label="Kassan vaiheet">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`${styles.stepItem} ${i === step ? styles.stepCurrent : ''} ${i < step ? styles.stepDone : ''}`}
              aria-current={i === step ? 'step' : undefined}
            >
              <button type="button" onClick={() => i < step && setStep(i)} disabled={i >= step}>
                <span className={styles.stepNo}>{i < step ? <Check aria-hidden="true" /> : String(i + 1).padStart(2, '0')}</span>
                <span className={styles.stepLabel}>{label}</span>
              </button>
            </li>
          ))}
        </ol>
      </header>

      <DemoNotice title="Kassan konsepti">
        Tämä näkymä havainnollistaa tulevan tilausprosessin. Syötettyjä tietoja ei tallenneta eikä lähetetä, eikä
        maksutietoja kysytä.
      </DemoNotice>

      <div className={styles.layout}>
        <div className={styles.main}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {step === 0 && (
                <form onSubmit={next} noValidate>
                  <StepTitle no={1}>Yhteystiedot</StepTitle>
                  <div className={styles.fields}>
                    <Field label="Nimi" error={errors.name} required>
                      <input
                        autoComplete="name"
                        value={contact.name}
                        onChange={(e) => setContact({ ...contact, name: e.target.value })}
                      />
                    </Field>
                    <Field label="Yritys" hint="Valinnainen">
                      <input
                        autoComplete="organization"
                        value={contact.company}
                        onChange={(e) => setContact({ ...contact, company: e.target.value })}
                      />
                    </Field>
                    <Field label="Sähköposti" error={errors.email} required>
                      <input
                        type="email"
                        autoComplete="email"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      />
                    </Field>
                    <Field label="Puhelin" error={errors.phone} required>
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className={styles.actions}>
                    <Button type="submit" size="lg" icon={<ArrowRight />}>
                      Jatka toimitukseen
                    </Button>
                  </div>
                </form>
              )}

              {step === 1 && (
                <form onSubmit={next}>
                  <StepTitle no={2}>Toimitustapa</StepTitle>
                  <div className={styles.options} role="radiogroup" aria-label="Toimitustapa">
                    <Option
                      name="delivery"
                      checked={delivery === 'nouto'}
                      onChange={() => setDelivery('nouto')}
                      icon={<Store />}
                      title={deliveryLabels.nouto}
                      text={`${company.address.street}, ${company.address.postalCode} ${company.address.city}. Noutoaika sovitaan puhelimitse.`}
                      aside="0 €"
                    />
                    <Option
                      name="delivery"
                      checked={delivery === 'sovittava'}
                      onChange={() => setDelivery('sovittava')}
                      icon={<Truck />}
                      title={deliveryLabels.sovittava}
                      text="Otamme yhteyttä ja sovimme toimitustavan sekä mahdolliset kulut tilauksen jälkeen."
                      aside="Sovitaan"
                    />
                  </div>
                  <div className={styles.actions}>
                    <Button type="button" variant="outline" onClick={() => setStep(0)}>
                      Takaisin
                    </Button>
                    <Button type="submit" size="lg" icon={<ArrowRight />}>
                      Jatka maksutapaan
                    </Button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={next}>
                  <StepTitle no={3}>Maksutapa</StepTitle>
                  <div className={styles.options} role="radiogroup" aria-label="Maksutapa">
                    <Option
                      name="payment"
                      checked={payment === 'verkkomaksu'}
                      onChange={() => setPayment('verkkomaksu')}
                      icon={<CreditCard />}
                      title={paymentLabels.verkkomaksu}
                      text="Valmiissa versiossa maksu tehdään turvallisesti maksunvälittäjän sivulla (esim. Paytrail tai Stripe). Korttitietoja ei koskaan syötetä tähän verkkokauppaan."
                    />
                    <Option
                      name="payment"
                      checked={payment === 'rahoitus'}
                      onChange={() => setPayment('rahoitus')}
                      icon={<Banknote />}
                      title={paymentLabels.rahoitus}
                      text="Isompiin hankintoihin voi hakea rahoitusta yhteistyökumppanin kautta."
                    />
                  </div>
                  <p className={styles.secure}>
                    <Lock aria-hidden="true" /> Maksuvaihtoehdot ovat esimerkkejä — lopulliset valitaan yhdessä
                    toteutusvaiheessa.
                  </p>
                  <div className={styles.actions}>
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      Takaisin
                    </Button>
                    <Button type="submit" size="lg" icon={<ArrowRight />}>
                      Tarkista tilaus
                    </Button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <div>
                  <StepTitle no={4}>Tarkista ja vahvista</StepTitle>
                  <dl className={styles.review}>
                    <div>
                      <dt className="mono">Yhteystiedot</dt>
                      <dd>
                        {contact.name}
                        {contact.company && `, ${contact.company}`}
                        <br />
                        {contact.email} · {contact.phone}
                      </dd>
                      <button type="button" onClick={() => setStep(0)}>
                        Muokkaa
                      </button>
                    </div>
                    <div>
                      <dt className="mono">Toimitus</dt>
                      <dd>{deliveryLabels[delivery]}</dd>
                      <button type="button" onClick={() => setStep(1)}>
                        Muokkaa
                      </button>
                    </div>
                    <div>
                      <dt className="mono">Maksutapa</dt>
                      <dd>{paymentLabels[payment]}</dd>
                      <button type="button" onClick={() => setStep(2)}>
                        Muokkaa
                      </button>
                    </div>
                  </dl>
                  <div className={styles.actions}>
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      Takaisin
                    </Button>
                    <Button type="button" size="lg" variant="signal" icon={<Check />} onClick={() => setDemoModal(true)}>
                      Lähetä tilaus · {formatEuro(subtotal)}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className={styles.summary} aria-label="Tilauksen yhteenveto">
          <h2 className={styles.summaryTitle}>
            Tilauksesi <span className="mono tabular">({count})</span>
          </h2>
          <ul className={styles.summaryLines} role="list">
            {lines.map((l) => (
              <li key={l.productId}>
                <span className={styles.summaryThumb}>
                  {l.image && <img src={l.image} alt="" />}
                  <span className="tabular">{l.quantity}</span>
                </span>
                <span className={styles.summaryName}>{l.name}</span>
                <span className="tabular">{formatEuro(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className={styles.summaryRows}>
            <div>
              <dt>Toimitus</dt>
              <dd>{delivery === 'nouto' ? '0 €' : 'Sovitaan'}</dd>
            </div>
            <div className={styles.summaryTotal}>
              <dt>Yhteensä</dt>
              <dd className="tabular">{formatEuro(subtotal)}</dd>
            </div>
            <div className={styles.summaryVat}>
              <dt>Sisältää ALV 25,5 %</dt>
              <dd className="tabular">{formatEuro(vat)}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <AnimatePresence>
        {demoModal && (
          <motion.div
            className={styles.modalRoot}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setDemoModal(false)}
          >
            <motion.div
              className={styles.modal}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="demo-title"
              aria-describedby="demo-text"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <span className={styles.modalIcon}>
                <Info aria-hidden="true" />
              </span>
              <h2 id="demo-title" className={`headline ${styles.modalTitle}`}>
                Tämä on esittelyversio.
              </h2>
              <p id="demo-text" className={styles.modalText}>
                Tilausta <strong>ei lähetetty</strong>, eikä mitään tietoja tallennettu. Verkkotilaukset ja maksaminen
                otetaan käyttöön valmiissa verkkokaupassa. Siihen asti tuotteet voi ostaa soittamalla tai
                sähköpostilla.
              </p>
              <div className={styles.modalActions}>
                <ButtonAnchor href={company.phone.href} icon={<Phone />}>
                  Soita {company.phone.display}
                </ButtonAnchor>
                <Button variant="outline" onClick={() => setDemoModal(false)} autoFocus>
                  Sulje
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StepTitle({ no, children }: { no: number; children: ReactNode }) {
  return (
    <h2 className={styles.stepTitle}>
      <span className="mono">Vaihe {no} / 4</span>
      {children}
    </h2>
  )
}

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className={`${styles.field} ${error ? styles.fieldError : ''}`}>
      <span className={styles.fieldLabel}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
        {hint && <span className={styles.fieldHint}>{hint}</span>}
      </span>
      {children}
      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </label>
  )
}

function Option({
  name,
  checked,
  onChange,
  icon,
  title,
  text,
  aside,
}: {
  name: string
  checked: boolean
  onChange: () => void
  icon: ReactNode
  title: string
  text: string
  aside?: string
}) {
  return (
    <label className={`${styles.option} ${checked ? styles.optionChecked : ''}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span className={styles.radio} aria-hidden="true" />
      <span className={styles.optionIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.optionBody}>
        <span className={styles.optionTitle}>{title}</span>
        <span className={styles.optionText}>{text}</span>
      </span>
      {aside && <span className={`mono ${styles.optionAside}`}>{aside}</span>}
    </label>
  )
}
