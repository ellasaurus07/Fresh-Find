// Tiny hash router: shareable links (#/markets/west-bay), working Back button,
// no server rewrites needed — the site stays 100% static.
import { useEffect, useState } from 'react'

export function parseHash(hash = window.location.hash) {
  const raw = hash.replace(/^#/, '') || '/'
  const [path, qs = ''] = raw.split('?')
  const parts = path.split('/').filter(Boolean)
  const query = Object.fromEntries(new URLSearchParams(qs))
  const [section = 'home', id = null] = parts
  return { section, id, query, path }
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash())
  useEffect(() => {
    const on = () => setRoute(parseHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export function go(to) {
  if (window.location.hash === to) return
  window.location.hash = to
}

export function withQuery(base, query) {
  const qs = new URLSearchParams(Object.entries(query).filter(([, v]) => v !== '' && v != null && v !== false)).toString()
  return qs ? `${base}?${qs}` : base
}

export const absoluteUrl = (hash) => `${window.location.origin}${window.location.pathname}${hash}`
