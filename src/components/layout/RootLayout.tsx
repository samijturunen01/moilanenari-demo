import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { ScrollRestoration, useLocation, useOutlet } from 'react-router'
import { CartDrawer } from './CartDrawer'
import { DemoBar } from './DemoBar'
import { Footer } from './Footer'
import { Header } from './Header'
import { SearchOverlay } from './SearchOverlay'

export function RootLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const [searchOpen, setSearchOpen] = useState(false)
  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  // "/" opens search anywhere outside form fields
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(el.tagName) && !el.isContentEditable) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">
        Siirry sisältöön
      </a>
      <DemoBar />
      <Header onSearch={openSearch} />
      <motion.main
        id="main"
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.2, 0.75, 0.1, 1] }}
      >
        {outlet}
      </motion.main>
      <Footer />
      <CartDrawer />
      <AnimatePresence>{searchOpen && <SearchOverlay onClose={closeSearch} />}</AnimatePresence>
      <ScrollRestoration />
    </MotionConfig>
  )
}
