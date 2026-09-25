// ---------------------------------------------------------------------------
// DATA ACCESS — every market, produce and seasonal record is read from the
// pre-populated JSON files in /src/data. Nothing is ever written back.
// produce.json is the single source of truth for which market sells what.
// ---------------------------------------------------------------------------
import MARKETS from '../data/markets.json'
import PRODUCE from '../data/produce.json'
import SEASONAL from '../data/seasonal.json'
import SITE from '../data/site.json'
import CHAT from '../data/chatbot.json'

export { MARKETS, PRODUCE, SEASONAL, SITE, CHAT }

export const CATEGORIES = [
  { id: 'fruits', label: 'Fruits', colour: '#c8412b' },
  { id: 'vegetables', label: 'Vegetables', colour: '#5e8f3a' },
  { id: 'herbs', label: 'Herbs', colour: '#3f7a4f' },
  { id: 'dairy', label: 'Dairy & eggs', colour: '#c99a2e' },
  { id: 'other', label: 'Other local produce', colour: '#8c3b6b' },
]
export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || id

export const marketById = Object.fromEntries(MARKETS.map((m) => [m.id, m]))
export const produceById = Object.fromEntries(PRODUCE.map((p) => [p.id, p]))

/** market id -> produce records sold there (derived from produce.json links). */
export const produceAtMarket = Object.fromEntries(
  MARKETS.map((m) => [m.id, PRODUCE.filter((p) => p.markets.includes(m.id))])
)
export const marketsForProduce = (p) => p.markets.map((id) => marketById[id]).filter(Boolean)

export const AREAS = [...new Set(MARKETS.map((m) => m.area))].sort()
export const areaCentre = (area) => {
  const m = MARKETS.find((x) => x.area === area)
  return m ? { lat: m.lat, lng: m.lng } : null
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const monthName = (m) => MONTHS[m - 1]
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3))

export const seasonOfMonth = (month) => SEASONAL.seasons.find((s) => s.months.includes(month))
export const inSeason = (p, month) => p.months.includes(month)
export const isYearRound = (p) => p.months.length === 12

/** "Jul – Sep" / "All year" — contiguous ranges, wrapping over New Year. */
export function seasonLabel(p) {
  if (isYearRound(p)) return 'All year'
  const ms = [...p.months].sort((a, b) => a - b)
  // find a start month whose predecessor is not in the set
  const start = ms.find((m) => !ms.includes(m === 1 ? 12 : m - 1)) ?? ms[0]
  const ordered = []
  for (let i = 0, m = start; i < 12; i += 1, m = (m % 12) + 1) if (ms.includes(m)) ordered.push(m)
  const ranges = []
  let s = ordered[0], prev = ordered[0]
  for (const m of ordered.slice(1)) {
    if (m === (prev % 12) + 1) { prev = m; continue }
    ranges.push([s, prev]); s = prev = m
  }
  ranges.push([s, prev])
  return ranges.map(([a, b]) => (a === b ? MONTHS_SHORT[a - 1] : `${MONTHS_SHORT[a - 1]} – ${MONTHS_SHORT[b - 1]}`)).join(', ')
}

/** Seasons (names) a produce item overlaps. */
export const seasonsFor = (p) => SEASONAL.seasons.filter((s) => s.months.some((m) => p.months.includes(m))).map((s) => s.name)

/** ISO week number — rotates "this week's picks" deterministically. */
export function weekNumber(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil(((t - y) / 86400000 + 1) / 7)
}

/** In-season now, seasonal (not year-round) items first; picks rotate weekly. */
export function seasonalPicks(now = new Date(), count = 6) {
  const month = now.getMonth() + 1
  const fresh = PRODUCE.filter((p) => inSeason(p, month) && !isYearRound(p))
  const w = weekNumber(now)
  const rotated = fresh.map((p, i) => ({ p, k: (i * 7 + w * 5) % (fresh.length || 1) })).sort((a, b) => a.k - b.k).map((x) => x.p)
  return rotated.slice(0, count)
}
/** Items whose season ends this month or next — "last chance". */
export function endingSoon(now = new Date()) {
  const month = now.getMonth() + 1
  const next = (month % 12) + 1
  return PRODUCE.filter((p) => !isYearRound(p) && inSeason(p, month) && !inSeason(p, (next % 12) + 1))
}
