import { company } from '../../data/company'
import { Reveal } from '../ui/Reveal'
import { SectionHead } from './SectionHead'
import styles from './HowItWorks.module.css'

const steps = [
  {
    title: 'Löydä laite',
    text: 'Selaa varastoa osastoittain tai hakusanalla. Hinnat sisältävät arvonlisäveron.',
  },
  {
    title: 'Kysy tai tule katsomaan',
    text: `Soita ${company.phone.display}. Laitteet ovat nähtävillä Joensuussa arkisin sopimuksen mukaan.`,
  },
  {
    title: 'Sovi toimitus',
    text: 'Toimitustapa sovitaan aina erikseen — nouto Joensuusta tai muu yhdessä sovittu ratkaisu.',
  },
  {
    title: 'Rahoita tarvittaessa',
    text: 'Isompiin hankintoihin voit hakea rahoitusta yhteistyökumppanimme Rahoitusturvan kautta.',
  },
]

export function HowItWorks() {
  return (
    <section className={styles.section} aria-labelledby="nain-kauppa-kay">
      <div className="container">
        <SectionHead
          id="nain-kauppa-kay"
          index="06"
          kicker="Näin kauppa käy"
          title={
            <>
              Laite hankittu <span className={styles.soft}>neljässä vaiheessa.</span>
            </>
          }
        />
        <ol className={styles.steps} role="list">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08} className={styles.step}>
              <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.title}>{s.title}</h3>
              <p className={styles.text}>{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
