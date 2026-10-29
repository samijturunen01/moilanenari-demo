import { useEffect } from 'react'

const BASE = 'Moilanen Ari'

/** Sets document.title; omit for the front page. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} — Käytetyt suurkeittiölaitteet ja Eurowagon-perävaunut`
  }, [title])
}
