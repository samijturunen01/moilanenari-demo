import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { BrandBand } from '../components/home/BrandBand'
import { CategoryIndex } from '../components/home/CategoryIndex'
import { EurowagonSection } from '../components/home/EurowagonSection'
import { Featured } from '../components/home/Featured'
import { Hero } from '../components/home/Hero'
import { HowItWorks } from '../components/home/HowItWorks'
import { SectionHead } from '../components/home/SectionHead'
import { Ticker } from '../components/home/Ticker'
import { VisitSection } from '../components/home/VisitSection'
import { ProductRail } from '../components/product/ProductRail'
import { useProducts } from '../lib/catalog'
import { formatDate } from '../lib/format'
import { usePageTitle } from '../lib/usePageTitle'
import styles from './HomePage.module.css'

export function HomePage() {
  usePageTitle()
  const products = useProducts()
  const newest = products.filter((p) => p.availability.status !== 'sold-out').slice(0, 10)

  return (
    <>
      <Hero />
      <Ticker />
      <CategoryIndex />
      <Featured />
      <section className={styles.newest} aria-labelledby="uusimmat">
        <div className="container">
          <SectionHead
            id="uusimmat"
            index="03"
            kicker={`Päivitetty ${formatDate(products[0].publishedAt)}`}
            title={
              <>
                Juuri saapuneet <span className={styles.soft}>varastoon.</span>
              </>
            }
            aside={
              <Link to="/tuotteet" className={styles.link}>
                Kaikki uutuudet <ArrowUpRight aria-hidden="true" />
              </Link>
            }
          />
        </div>
        <ProductRail products={newest} label="Uusimmat tuotteet" />
      </section>

      <EurowagonSection />
      <BrandBand />
      <HowItWorks />
      <VisitSection />
    </>
  )
}
