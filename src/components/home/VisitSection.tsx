import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { company } from '../../data/company'
import { Reveal } from '../ui/Reveal'
import styles from './VisitSection.module.css'

export function VisitSection() {
  return (
    <section className={styles.section} aria-labelledby="kaynti">
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.copy}>
          <p className="mono">
            <span className={styles.index}>07</span> Yhteystiedot
          </p>
          <h2 id="kaynti" className={`display ${styles.title}`}>
            Tervetuloa Joensuuhun.
          </h2>
          <p className="lede">
            Laitteet ovat nähtävillä paikan päällä. {company.visitNote} Kysy myös, jos et löydä etsimääsi verkosta.
          </p>
        </Reveal>

        <Reveal className={styles.card} delay={0.1}>
          <a href={company.phone.href} className={styles.big}>
            <Phone aria-hidden="true" />
            <span>
              <span className="mono">Puhelin</span>
              <span className={`${styles.value} tabular`}>{company.phone.display}</span>
            </span>
          </a>
          <a href={`mailto:${company.email}`} className={styles.big}>
            <Mail aria-hidden="true" />
            <span>
              <span className="mono">Sähköposti</span>
              <span className={styles.value}>{company.email}</span>
            </span>
          </a>
          <a href={company.mapsHref} target="_blank" rel="noreferrer" className={styles.big}>
            <MapPin aria-hidden="true" />
            <span>
              <span className="mono">Osoite</span>
              <span className={styles.value}>
                {company.address.street}, {company.address.postalCode} {company.address.city}
              </span>
            </span>
            <ArrowUpRight aria-hidden="true" className={styles.ext} />
          </a>
          <div className={styles.hours}>
            <span className="mono">Aukioloajat</span>
            <span>{company.openingHours}</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
