import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { FilterSelects } from './QuickFind.jsx'
import { StatusPill, Distance } from './UI.jsx'
import { MARKETS, PRODUCE, categoryLabel, seasonLabel } from '../lib/data.js'
import { filterMarkets, sortMarkets } from '../lib/filters.js'
import { useApp } from '../lib/context.js'
import { go, withQuery } from '../lib/router.js'

// Global Search / Find-a-Market (cross-page, SRS). Results update as you type.
export default function SearchOverlay({ open, onClose }) {
  const { now, geo } = useApp()
  const [q, setQ] = useState('')
  const [f, setF] = useState({ area: '', day: '', produce: '' })
  const inputRef = useRef(null)
  const lastFocus = useRef(null)
  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement
      setTimeout(() => inputRef.current?.focus(), 30)
    } else lastFocus.current?.focus?.()
  }, [open])
  useEffect(() => {
    if (!open) return
    const esc = (e) => { if (e.key === 'Escape') { e.preventDefault(); onClose() } }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open, onClose])

  const markets = useMemo(
    () => sortMarkets(filterMarkets(MARKETS, { ...f, q }, now), geo.coords ? 'near' : 'next', { now, origin: geo.coords }),
    [f, q, now, geo.coords]
  )
  const produce = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s && !f.produce) return []
    return PRODUCE.filter((p) => (!s || `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(s)) && (!f.produce || p.id === f.produce || p.category === f.produce)).slice(0, 6)
  }, [q, f.produce])

  if (!open) return null
  const pick = (to) => { onClose(); go(to) }
  return (
    <div className="search is-open" role="dialog" aria-modal="true" aria-label="Find a market" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search__panel">
        <div className="search__bar">
          <Icon name="search" />
          <input ref={inputRef} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a market, a vegetable, a neighbourhood…" aria-label="Search FreshFind" aria-controls="search-results" />
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search"><Icon name="close" /></button>
        </div>
        <div className="search__filters"><FilterSelects value={f} onChange={setF} idBase="search" /></div>
        <div id="search-results" className="search__results allow-scroll" aria-live="polite">
          <h2 className="search__h">Markets <small>{markets.length}</small></h2>
          {markets.length === 0 && <p className="empty-line">No market matches those filters. Try “Any day” or another neighbourhood.</p>}
          <ul>
            {markets.slice(0, 8).map((m) => (
              <li key={m.id}>
                <button type="button" className="result" onClick={() => pick(`#/markets/${m.id}`)}>
                  <img src={m.thumb} alt="" width="64" height="48" loading="lazy" />
                  <span><strong>{m.name}</strong><small>{m.area} <Distance market={m} /></small></span>
                  <StatusPill market={m} />
                </button>
              </li>
            ))}
          </ul>
          {produce.length > 0 && (
            <>
              <h2 className="search__h">Produce <small>{produce.length}</small></h2>
              <ul>
                {produce.map((p) => (
                  <li key={p.id}>
                    <button type="button" className="result" onClick={() => pick(`#/produce/${p.id}`)}>
                      <img src={p.image} alt="" width="48" height="48" loading="lazy" className="result__art" />
                      <span><strong>{p.name}</strong><small>{categoryLabel(p.category)} · {seasonLabel(p)}</small></span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="search__foot">
          <button type="button" className="btn btn--primary" onClick={() => pick(withQuery('#/markets', { ...f, q }))}>
            <span>Open in the directory</span><Icon name="arrow" size={18} />
          </button>
          <span className="kbd-hint">Press <kbd>/</kbd> anywhere to search</span>
        </div>
      </div>
    </div>
  )
}
