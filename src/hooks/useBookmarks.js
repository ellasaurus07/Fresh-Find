import { useCallback, useEffect, useMemo, useState } from 'react'
import { marketById, produceById, categoryLabel, seasonLabel } from '../lib/data.js'
import { scheduleSummary } from '../lib/schedule.js'

// ---------------------------------------------------------------------------
// BOOKMARKS (SRS "Content Bookmarking System") — ported and extended.
//   favourites  -> localStorage   (persist on this device)
//   notes       -> sessionStorage (session-only, as the SRS requires)
// Records hold only { type, id, savedAt }; names/images are re-resolved from
// the JSON data, so stale copies can never drift from the source.
// ---------------------------------------------------------------------------
const BOOKMARK_KEY = 'freshfind.bookmarks'
const NOTE_KEY = 'freshfind.notes'
const read = (store, key, fallback) => {
  try { const raw = store.getItem(key); return raw ? JSON.parse(raw) : fallback } catch (_) { return fallback }
}
const write = (store, key, value) => { try { store.setItem(key, JSON.stringify(value)) } catch (_) { /* full/blocked */ } }
const keyOf = (type, id) => `${type}:${id}`

export function resolveBookmark(b) {
  const item = b.type === 'market' ? marketById[b.id] : produceById[b.id]
  return item ? { ...b, item } : null
}

export default function useBookmarks() {
  const [list, setList] = useState(() => read(localStorage, BOOKMARK_KEY, []).filter((b) => b && b.type && b.id))
  const [notes, setNotes] = useState(() => read(sessionStorage, NOTE_KEY, {}))
  useEffect(() => write(localStorage, BOOKMARK_KEY, list), [list])
  useEffect(() => write(sessionStorage, NOTE_KEY, notes), [notes])
  // keep several tabs in step
  useEffect(() => {
    const on = (e) => { if (e.key === BOOKMARK_KEY) setList(read(localStorage, BOOKMARK_KEY, [])) }
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
  }, [])

  const has = useCallback((type, id) => list.some((b) => b.type === type && b.id === id), [list])
  const toggle = useCallback((type, id) => {
    let added = false
    setList((cur) => {
      if (cur.some((b) => b.type === type && b.id === id)) return cur.filter((b) => !(b.type === type && b.id === id))
      added = true
      return [...cur, { type, id, savedAt: new Date().toISOString() }]
    })
    return added
  }, [])
  const remove = useCallback((type, id) => {
    setList((cur) => cur.filter((b) => !(b.type === type && b.id === id)))
    setNotes((cur) => { const k = keyOf(type, id); if (!(k in cur)) return cur; const n = { ...cur }; delete n[k]; return n })
  }, [])
  const clearAll = useCallback(() => { setList([]); setNotes({}) }, [])
  const setNote = useCallback((type, id, text) => setNotes((cur) => ({ ...cur, [keyOf(type, id)]: text })), [])
  const getNote = useCallback((type, id) => notes[keyOf(type, id)] || '', [notes])

  const resolved = useMemo(() => list.map(resolveBookmark).filter(Boolean), [list])

  /** Formatted, human-readable list (SRS: export bookmarks as a formatted list). */
  const formatList = useCallback(() => {
    const markets = resolved.filter((b) => b.type === 'market')
    const produce = resolved.filter((b) => b.type === 'produce')
    const lines = ['FRESHFIND — MY SAVED LIST', `Exported ${new Date().toLocaleString()}`, '']
    if (markets.length) {
      lines.push(`MARKETS (${markets.length})`, '-'.repeat(32))
      markets.forEach((b, i) => {
        const m = b.item
        lines.push(`${i + 1}. ${m.name}`, `   ${m.address}`, `   ${scheduleSummary(m)}`)
        const n = notes[keyOf('market', m.id)]
        if (n) lines.push(`   Note: ${n}`)
        lines.push('')
      })
    }
    if (produce.length) {
      lines.push(`PRODUCE (${produce.length})`, '-'.repeat(32))
      produce.forEach((b, i) => {
        const p = b.item
        lines.push(`${i + 1}. ${p.name} — ${categoryLabel(p.category)}`, `   In season: ${seasonLabel(p)}`, `   Found at: ${p.markets.map((id) => marketById[id]?.name).filter(Boolean).join(', ')}`)
        const n = notes[keyOf('produce', p.id)]
        if (n) lines.push(`   Note: ${n}`)
        lines.push('')
      })
    }
    if (!markets.length && !produce.length) lines.push('(Nothing saved yet.)')
    lines.push('Made with FreshFind · Fresh All Along')
    return lines.join('\n')
  }, [resolved, notes])

  return { list, resolved, has, toggle, remove, clearAll, setNote, getNote, formatList, count: resolved.length }
}
