import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type TouchEvent as ReactTouchEvent } from 'react'
import type { ProductImage } from '../../types/catalog'
import styles from './Gallery.module.css'

const EASE = [0.2, 0.75, 0.1, 1] as const

export function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [lightbox, setLightbox] = useState(false)
  const touchX = useRef<number | null>(null)
  const count = images.length
  const current = images[index]

  const go = useCallback(
    (delta: number) => {
      setDirection(delta)
      setIndex((i) => (i + delta + count) % count)
    },
    [count],
  )

  const select = (i: number) => {
    setDirection(i > index ? 1 : -1)
    setIndex(i)
  }

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [lightbox, go])

  if (!current) return <div className={styles.placeholder}>Ei kuvaa</div>

  const swipe = {
    onTouchStart: (e: ReactTouchEvent) => (touchX.current = e.touches[0].clientX),
    onTouchEnd: (e: ReactTouchEvent) => {
      if (touchX.current === null) return
      const dx = e.changedTouches[0].clientX - touchX.current
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
      touchX.current = null
    },
  }

  return (
    <div className={styles.gallery}>
      <div
        className={styles.stage}
        {...swipe}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1)
          if (e.key === 'ArrowLeft') go(-1)
        }}
        role="region"
        aria-roledescription="kuvagalleria"
        aria-label={`${name} — kuva ${index + 1} / ${count}`}
        tabIndex={0}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={current.src}
            src={current.src}
            alt={current.alt}
            width={current.width}
            height={current.height}
            className={styles.image}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.45, ease: EASE }}
            fetchPriority={index === 0 ? 'high' : undefined}
          />
        </AnimatePresence>

        <span className={styles.counter}>
          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>

        <button type="button" className={styles.expand} onClick={() => setLightbox(true)} aria-label="Avaa kuva koko näytölle">
          <Maximize2 aria-hidden="true" />
        </button>

        {count > 1 && (
          <div className={styles.arrows}>
            <button type="button" onClick={() => go(-1)} aria-label="Edellinen kuva">
              <ChevronLeft aria-hidden="true" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Seuraava kuva">
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {count > 1 && (
        <ul className={styles.thumbs} role="list">
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                className={`${styles.thumb} ${i === index ? styles.thumbActive : ''}`}
                onClick={() => select(i)}
                aria-label={`Näytä kuva ${i + 1}`}
                aria-current={i === index}
              >
                <img src={img.thumb} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className={styles.lightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`${name}, kuvat`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            {...swipe}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.img
                key={current.src}
                src={current.src}
                alt={current.alt}
                className={styles.lightboxImage}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              />
            </AnimatePresence>
            <div className={styles.lightboxBar}>
              <span className="mono">
                {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')} — {name}
              </span>
              <div className={styles.lightboxButtons}>
                {count > 1 && (
                  <>
                    <button type="button" onClick={() => go(-1)} aria-label="Edellinen kuva">
                      <ChevronLeft aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => go(1)} aria-label="Seuraava kuva">
                      <ChevronRight aria-hidden="true" />
                    </button>
                  </>
                )}
                <button type="button" onClick={() => setLightbox(false)} aria-label="Sulje" autoFocus>
                  <X aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
