import { ArrowRight, ArrowUpRight, Phone } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { ButtonAnchor, ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { company } from '../data/company'
import { useCategories, useProducts, useProductsById } from '../lib/catalog'
import { usePageTitle } from '../lib/usePageTitle'
import styles from './AboutPage.module.css'

/** Photos of listed products whose backgrounds show the warehouse. */
const WAREHOUSE_SHOTS = [3398, 3778, 2187]

export function AboutPage() {
  usePageTitle('Yritys')
  const products = useProducts()
  const categories = useCategories()
  const shots = useProductsById(WAREHOUSE_SHOTS)

  const stats = useMemo(() => {
    const text = (d: (typeof products)[number]['description']) =>
      d.map((b) => (b.type === 'p' ? b.text : b.items.join(' '))).join(' ').toLowerCase()
    return {
      total: products.length,
      brands: new Set(products.map((p) => p.brand).filter(Boolean)).size,
      onSale: products.filter((p) => p.price.kind === 'fixed' && p.price.regularAmount).length,
      teaching: products.filter((p) => /opetuskeitti|opetusleipomo/.test(text(p.description))).length,
      perCategory: categories.map((c) => ({ ...c, count: products.filter((p) => p.category === c.id).length })),
    }
  }, [products, categories])

  return (
    <div className={styles.page}>
      <section className={`container ${styles.hero}`}>
        <p className={`mono ${styles.kicker}`}>Yritys</p>
        <h1 className={`display ${styles.title}`}>
          Käytettyä kalustoa {'ammatti­keittiöihin'}<span className={styles.dot}>.</span>
        </h1>
        <div className={styles.heroGrid}>
          <p className="lede">
            {company.name} myy käytettyjä ravintola- ja suurkeittiölaitteita Joensuusta: liesiä, uuneja, rst-kalusteita,
            yleiskoneita, kylmälaitteita, keittopatoja, lämpökaappeja, rasvakeittimiä ja vihannesleikkureita. Meiltä
            löydät myös kotimaiset Eurowagon-perävaunut.
          </p>
          <p className={styles.heroSide}>
            Laaja valikoima yrityksesi tarpeisiin. Jos etsimääsi ei löydy verkosta, kysy — toimitustapa on aina
            sovittavissa.
          </p>
        </div>
      </section>

      <section className={`container ${styles.shots}`} aria-label="Kuvia varastolta">
        {shots.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08} className={styles.shot}>
            <img src={p.images[0].src} alt={p.name} loading={i === 0 ? 'eager' : 'lazy'} />
            <span className={styles.shotTag}>Nro {p.id}</span>
          </Reveal>
        ))}
        <p className={`mono ${styles.shotsCaption}`}>Kuvat: myynnissä olevia tuotteita</p>
      </section>

      <section className={`container ${styles.numbers}`} aria-label="Valikoima lukuina">
        {[
          { value: stats.total, label: 'tuotetta verkossa' },
          { value: categories.length, label: 'osastoa' },
          { value: stats.brands, label: 'merkkiä' },
          { value: stats.onSale, label: 'tuotetta tarjoushinnalla' },
        ].map((n, i) => (
          <Reveal key={n.label} delay={i * 0.06} className={styles.number}>
            <span className={`${styles.numberValue} tabular`}>{n.value}</span>
            <span className={styles.numberLabel}>{n.label}</span>
          </Reveal>
        ))}
        <p className={`mono ${styles.numbersNote}`}>Luvut lasketaan suoraan tuoteluettelosta.</p>
      </section>

      <section className={`container ${styles.split}`}>
        <Reveal className={styles.splitHead}>
          <p className="mono">Mistä laitteet tulevat</p>
          <h2 className={`headline ${styles.h2}`}>Toinen kierros hyville laitteille.</h2>
        </Reveal>
        <Reveal className={styles.splitBody} delay={0.06}>
          <p>
            Valikoimassa on tunnettujen valmistajien laitteita, kuten Metos, Electrolux, Dieta ja Porkka. Jokaisen
            tuotteen kunto kerrotaan myyjän omin sanoin tuotekuvauksessa — esimerkiksi “uusi ja käyttämätön”, “kuin uusi”
            tai “vähän käytetty”.
          </p>
          <p>
            Tällä hetkellä {stats.teaching} ilmoituksessa laitteen kerrotaan tulevan opetuskeittiön tai -leipomon käytöstä.
          </p>
          <div className={styles.placeholder} role="note">
            <span className={styles.placeholderBadge}>Paikkamerkki</span>
            <p>
              Tähän kohtaan kirjoitetaan yrityksen oma tarina — esimerkiksi toiminnan alku, kokemus alalta ja
              periaatteet. Tekstit täydennetään yhdessä yrittäjän kanssa; demossa ei esitetä keksittyjä tietoja.
            </p>
          </div>
        </Reveal>
      </section>

      <section className={`container ${styles.departments}`} aria-labelledby="valikoima">
        <h2 id="valikoima" className={`headline ${styles.h2}`}>
          Valikoima
        </h2>
        <ul role="list" className={styles.deptList}>
          {stats.perCategory.map((c) => (
            <li key={c.id}>
              <Link to={`/tuotteet/${c.id}`} className={styles.dept}>
                <span className="mono">{c.index}</span>
                <span className={styles.deptName}>{c.name}</span>
                <span className={styles.deptDesc}>{c.description}</span>
                <span className="mono tabular">{c.count}</span>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${styles.service} grain`}>
        <div className={`container ${styles.serviceGrid}`}>
          <div>
            <p className={`mono ${styles.serviceKicker}`}>Asiointi</p>
            <h2 className={`headline ${styles.serviceTitle}`}>Helppo kauppa, henkilökohtaisesti.</h2>
          </div>
          <dl className={styles.facts}>
            <div>
              <dt className="mono">Nähtävillä</dt>
              <dd>
                {company.address.street}, {company.address.city}. {company.openingHours} — {company.visitNote.toLowerCase()}
              </dd>
            </div>
            <div>
              <dt className="mono">Toimitus</dt>
              <dd>{company.delivery}. Nouto Joensuusta onnistuu sovitusti.</dd>
            </div>
            <div>
              <dt className="mono">Hinnat</dt>
              <dd>{company.vatNote}.</dd>
            </div>
            <div>
              <dt className="mono">Rahoitus</dt>
              <dd>
                Rahoitusta voi hakea{' '}
                <a href={company.financing.href} target="_blank" rel="noreferrer">
                  {company.financing.partner}n kautta <ArrowUpRight aria-hidden="true" />
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={`container ${styles.cta}`}>
        <h2 className={`display ${styles.ctaTitle}`}>Kysy, niin katsotaan.</h2>
        <div className={styles.ctaActions}>
          <ButtonAnchor href={company.phone.href} size="lg" icon={<Phone />}>
            {company.phone.display}
          </ButtonAnchor>
          <ButtonLink to="/yhteystiedot" size="lg" variant="outline" icon={<ArrowRight />}>
            Yhteystiedot
          </ButtonLink>
        </div>
      </section>
    </div>
  )
}
