import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { company } from '../../data/company'
import { useCategories } from '../../lib/catalog'
import { Wordmark } from '../ui/Wordmark'
import styles from './Footer.module.css'

const YEAR = new Date().getFullYear()

export function Footer() {
  const categories = useCategories()

  return (
    <footer className={`${styles.footer} grain`}>
      <div className="container">
        <div className={styles.cta}>
          <p className={`display ${styles.ctaText}`}>
            Etkö löytänyt etsimääsi? <span className={styles.ctaSoft}>Kysy — varastossa on usein muutakin.</span>
          </p>
          <a href={company.phone.href} className={styles.ctaPhone}>
            <span className="mono">Soita</span>
            <span className="tabular">{company.phone.display}</span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <div className={styles.columns}>
          <nav aria-label="Osastot">
            <h2 className={`mono ${styles.heading}`}>Osastot</h2>
            <ul role="list" className={styles.list}>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/tuotteet/${c.id}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={`mono ${styles.heading}`}>Asiointi</h2>
            <ul role="list" className={styles.list}>
              <li>{company.delivery}</li>
              <li>Nouto Joensuusta</li>
              <li>{company.vatNote}</li>
              <li>
                <a href={company.financing.href} target="_blank" rel="noreferrer" className={styles.ext}>
                  {company.financing.label} <ArrowUpRight aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className={`mono ${styles.heading}`}>Yhteystiedot</h2>
            <address className={styles.address}>
              {company.address.street}
              <br />
              {company.address.postalCode} {company.address.city}
              <br />
              <a href={company.phone.href}>{company.phone.international}</a>
              <br />
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </address>
            <p className={styles.hours}>
              {company.openingHours}. {company.visitNote}
            </p>
          </div>

          <div>
            <h2 className={`mono ${styles.heading}`}>Sivusto</h2>
            <ul role="list" className={styles.list}>
              <li>
                <Link to="/tuotteet">Kaikki tuotteet</Link>
              </li>
              <li>
                <Link to="/yritys">Yritys</Link>
              </li>
              <li>
                <Link to="/yhteystiedot">Yhteystiedot</Link>
              </li>
              <li>
                <Link to="/ostoskori">Ostoskori</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.mark}>
          <Wordmark tone="paper" size="xl" />
        </div>

        <div className={styles.bottom}>
          <span>© {YEAR} {company.name}</span>
          <span>Konseptidemo — ei toimiva verkkokauppa. Tuotetiedot ja kuvat: moilanenari.fi.</span>
        </div>
      </div>
    </footer>
  )
}
