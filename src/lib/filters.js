// Shared market filtering + sorting — used by Quick Find, the Directory,
// the curved archive and FreshBot, so every entry point agrees.
import { operatesOn, minutesUntilOpen, currentSlot } from './schedule.js'
import { produceAtMarket, PRODUCE } from './data.js'
import { distanceKm } from './geo.js'

export const SORTS = [
  { id: 'next', label: 'Next open' },
  { id: 'az', label: 'A – Z' },
  { id: 'near', label: 'Nearest' },
]

export function marketSells(market, produceKey) {
  if (!produceKey) return true
  const items = produceAtMarket[market.id]
  // produceKey may be a category id ("fruits") or a produce id ("tomato")
  return items.some((p) => p.id === produceKey || p.category === produceKey)
}

export function matchesText(market, q) {
  if (!q) return true
  const s = q.trim().toLowerCase()
  if (!s) return true
  const hay = [market.name, market.area, market.description, ...market.tags, ...produceAtMarket[market.id].map((p) => p.name)]
    .join(' ')
    .toLowerCase()
  return s.split(/\s+/).every((w) => hay.includes(w))
}

/**
 * @param f { area, day (''|0-6), produce, q, openNow, organic }
 */
export function filterMarkets(markets, f, now = new Date()) {
  return markets.filter(
    (m) =>
      (!f.area || m.area === f.area) &&
      (f.day === '' || f.day == null || operatesOn(m, Number(f.day))) &&
      marketSells(m, f.produce) &&
      matchesText(m, f.q) &&
      (!f.openNow || !!currentSlot(m, now)) &&
      (!f.organic || m.tags.includes('organic'))
  )
}

export function sortMarkets(markets, sort, { now = new Date(), origin = null } = {}) {
  const list = [...markets]
  if (sort === 'az') return list.sort((a, b) => a.name.localeCompare(b.name))
  if (sort === 'near' && origin) return list.sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b))
  // next open (and the fallback for "near" without a location)
  return list.sort((a, b) => minutesUntilOpen(a, now) - minutesUntilOpen(b, now) || a.name.localeCompare(b.name))
}

export const PRODUCE_FILTER_OPTIONS = [
  { value: 'fruits', label: 'Any fruit' },
  { value: 'vegetables', label: 'Any vegetable' },
  { value: 'herbs', label: 'Any herb' },
  { value: 'dairy', label: 'Dairy & eggs' },
  { value: 'other', label: 'Other local produce' },
  ...PRODUCE.map((p) => ({ value: p.id, label: p.name })).sort((a, b) => a.label.localeCompare(b.label)),
]

/** Does a globe/archive tile belong to an orbit tag (used to light up a category on hover)? */
export function tileMatchesTag(t, tag, hasLocation = false) {
  switch (tag) {
    case 'all': return true
    case 'markets': return t.kind === 'market'
    case 'open': return t.kind === 'market' && !!t.open
    case 'nearby': return t.kind === 'market' && (hasLocation ? !!t.near : true)
    case 'organic': return !!t.organic
    default: return t.cats.includes(tag)
  }
}
