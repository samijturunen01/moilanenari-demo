import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, Phone, Search, ShoppingBag, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router'
import { useCart } from '../../cart/context'
import { company } from '../../data/company'
import { useCategories, useProducts } from '../../lib/catalog'
import type { CategoryId } from '../../types/catalog'
import { Wordmark } from '../ui/Wordmark'
import styles from './Header.module.css'

const EASE = [0.2, 0.75, 0.1, 1] as const

export function Header({ onSearch }: { onSearch: () => void }) {
  const [open, setOpen] = useState<'none' | 'mega' | 'mobile'>('none')
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { count, openDrawer } = useCart()
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const headerRef = useRef<HTMLElement>(null)
  const [panelTop, setPanelTop] = useState(0)

  // Close menus on navigation
  const [lastPath, setLastPath] = useState(location.key)
  if (lastPath !== location.key) {
    setLastPath(location.key)
    setOpen('none')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (open === 'none') return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen('none')
    window.addEventListener('keydown', onKey)
    if (open === 'mobile') document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [open])

  const hoverOpen = () => {
    clearTimeout(closeTimer.current)
    setOpen('mega')
  }
  const hoverClose = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen((o) => (o === 'mega' ? 'none' : o)), 180)
  }

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${scrolled || open !== 'none' ? styles.raised : ''}`}
      onMouseLeave={hoverClose}
    >
      <div className={`container ${styles.bar}`}>
        <Link to="/" className={styles.logo}>
          <Wordmark />
        </Link>

        <nav className={styles.nav} aria-label="Päävalikko">
          <button
            type="button"
            className={`${styles.navItem} ${open === 'mega' ? styles.navItemActive : ''}`}
            aria-expanded={open === 'mega'}
            aria-controls="mega-menu"
            onClick={() => setOpen((o) => (o === 'mega' ? 'none' : 'mega'))}
            onMouseEnter={hoverOpen}
          >
            Tuotteet <ChevronDown aria-hidden="true" className={styles.chevron} />
          </button>
          <NavLink to="/tuotteet/peravaunut" className={styles.navItem} onMouseEnter={hoverClose}>
            Eurowagon
          </NavLink>
          <NavLink to="/yritys" className={styles.navItem} onMouseEnter={hoverClose}>
            Yritys
          </NavLink>
          <NavLink to="/yhteystiedot" className={styles.navItem} onMouseEnter={hoverClose}>
            Yhteystiedot
          </NavLink>
        </nav>

        <div className={styles.actions}>
          <a href={company.phone.href} className={styles.phone}>
            <Phone aria-hidden="true" />
            <span className="tabular">{company.phone.display}</span>
          </a>
          <button type="button" className={styles.iconButton} onClick={onSearch} aria-label="Hae tuotteita">
            <Search aria-hidden="true" />
            <kbd className={styles.kbd}>/</kbd>
          </button>
          <button type="button" className={styles.cartButton} onClick={openDrawer} aria-label={`Ostoskori, ${count} tuotetta`}>
            <ShoppingBag aria-hidden="true" />
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={count}
                className={`${styles.count} ${count ? styles.countActive : ''} tabular`}
                initial={{ y: -14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 14, opacity: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.menuButton}`}
            onClick={() => {
              setPanelTop(headerRef.current?.getBoundingClientRect().bottom ?? 0)
              setOpen((o) => (o === 'mobile' ? 'none' : 'mobile'))
            }}
            aria-expanded={open === 'mobile'}
            aria-controls="mobile-menu"
            aria-label={open === 'mobile' ? 'Sulje valikko' : 'Avaa valikko'}
          >
            {open === 'mobile' ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>{open === 'mega' && <MegaMenu onEnter={hoverOpen} />}</AnimatePresence>
      {/* Portal: the header's backdrop-filter would otherwise trap position: fixed */}
      {createPortal(
        <AnimatePresence>{open === 'mobile' && <MobileMenu onSearch={onSearch} top={panelTop} />}</AnimatePresence>,
        document.body,
      )}
    </header>
  )
}

function useCategoryCovers() {
  const products = useProducts()
  const categories = useCategories()
  return useMemo(() => {
    const counts = new Map<CategoryId, number>()
    for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
    return categories.map((c) => ({
      ...c,
      count: counts.get(c.id) ?? 0,
      cover: products.find((p) => p.id === c.coverProductId)?.images[0],
    }))
  }, [products, categories])
}

function MegaMenu({ onEnter }: { onEnter: () => void }) {
  const items = useCategoryCovers()
  const total = useProducts().length
  const [active, setActive] = useState(items[0].id)
  const current = items.find((c) => c.id === active) ?? items[0]

  return (
    <motion.div
      id="mega-menu"
      className={styles.mega}
      onMouseEnter={onEnter}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.25, ease: EASE } }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className={`container ${styles.megaInner}`}>
        <ul className={styles.megaList} role="list">
          {items.map((c) => (
            <li key={c.id}>
              <Link
                to={`/tuotteet/${c.id}`}
                className={`${styles.megaLink} ${c.id === active ? styles.megaLinkActive : ''}`}
                onMouseEnter={() => setActive(c.id)}
                onFocus={() => setActive(c.id)}
              >
                <span className={styles.megaIndex}>{c.index}</span>
                <span className={styles.megaName}>{c.name}</span>
                <span className={`${styles.megaCount} tabular`}>{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.megaPreview}>
          <div className={styles.megaImage}>
            <AnimatePresence mode="popLayout" initial={false}>
              {current.cover && (
                <motion.img
                  key={current.id}
                  src={current.cover.thumb}
                  alt=""
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              )}
            </AnimatePresence>
          </div>
          <div className={styles.megaCopy}>
            <p className="mono">
              {current.index} / {current.count} tuotetta
            </p>
            <p className={styles.megaDesc}>{current.description}</p>
            <Link to={`/tuotteet/${current.id}`} className={styles.megaMore}>
              Selaa osastoa <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <Link to="/tuotteet" className={styles.megaAll}>
          <span>Kaikki tuotteet</span>
          <span className="tabular">{total}</span>
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  )
}

function MobileMenu({ onSearch, top }: { onSearch: () => void; top: number }) {
  const items = useCategoryCovers()

  return (
    <motion.div
      id="mobile-menu"
      className={`${styles.mobile} grain`}
      style={{ top }}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.3, ease: EASE } }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <nav className={styles.mobileInner} aria-label="Mobiilivalikko">
        <button type="button" className={styles.mobileSearch} onClick={onSearch}>
          <Search aria-hidden="true" /> Hae tuotteita…
        </button>

        <p className={`mono ${styles.mobileLabel}`}>Osastot</p>
        <ul className={styles.mobileList} role="list">
          {items.map((c, i) => (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.03, duration: 0.4, ease: EASE }}
            >
              <Link to={`/tuotteet/${c.id}`} className={styles.mobileLink}>
                <span className={styles.megaIndex}>{c.index}</span>
                <span>{c.name}</span>
                <span className={`${styles.megaCount} tabular`}>{c.count}</span>
              </Link>
            </motion.li>
          ))}
        </ul>

        <div className={styles.mobileSecondary}>
          <Link to="/tuotteet">Kaikki tuotteet</Link>
          <Link to="/yritys">Yritys</Link>
          <Link to="/yhteystiedot">Yhteystiedot</Link>
          <Link to="/ostoskori">Ostoskori</Link>
        </div>

        <a href={company.phone.href} className={styles.mobileCall}>
          <span className="mono">Soita</span>
          <span className="tabular">{company.phone.display}</span>
        </a>
        <p className={styles.mobileAddress}>
          {company.address.street}, {company.address.postalCode} {company.address.city}
        </p>
      </nav>
    </motion.div>
  )
}
