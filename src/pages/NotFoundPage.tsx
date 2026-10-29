import { ArrowRight, Phone } from 'lucide-react'
import { ButtonAnchor, ButtonLink } from '../components/ui/Button'
import { company } from '../data/company'
import { usePageTitle } from '../lib/usePageTitle'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  usePageTitle('Sivua ei löytynyt')
  return (
    <section className={`container ${styles.page}`}>
      <p className={`mono ${styles.code}`}>Virhe 404</p>
      <h1 className={`display ${styles.title}`}>
        Tämä hylly on tyhjä<span>.</span>
      </h1>
      <p className="lede">Etsimääsi sivua tai tuotetta ei löytynyt — se on ehkä jo myyty. Katso varaston muut tuotteet.</p>
      <div className={styles.actions}>
        <ButtonLink to="/tuotteet" size="lg" icon={<ArrowRight />}>
          Kaikki tuotteet
        </ButtonLink>
        <ButtonAnchor href={company.phone.href} size="lg" variant="outline" icon={<Phone />}>
          {company.phone.display}
        </ButtonAnchor>
      </div>
    </section>
  )
}
