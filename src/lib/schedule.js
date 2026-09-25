// ---------------------------------------------------------------------------
// OPENING HOURS — driven by the browser's real clock and each market's
// weekly schedule in markets.json. Nothing here is a fixed label.
// Days use JavaScript's numbering: 0 = Sunday … 6 = Saturday.
// ---------------------------------------------------------------------------
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
/** Monday-first order, for weekly tables. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

export const toMinutes = (hm) => {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}

const minutesOf = (d) => d.getHours() * 60 + d.getMinutes()

export function slotsOn(market, day) {
  return market.schedule.filter((s) => s.day === day).sort((a, b) => toMinutes(a.open) - toMinutes(b.open))
}

export const operatesOn = (market, day) => market.schedule.some((s) => s.day === day)

/** Is the market trading at `now`? Returns the current slot or null. */
export function currentSlot(market, now = new Date()) {
  const t = minutesOf(now)
  return slotsOn(market, now.getDay()).find((s) => t >= toMinutes(s.open) && t < toMinutes(s.close)) || null
}

/**
 * The next opening strictly after `now` (or null when the market has no schedule).
 * { day, open, close, inDays, minutesUntil }
 */
export function nextOpening(market, now = new Date()) {
  const t = minutesOf(now)
  for (let offset = 0; offset < 8; offset += 1) {
    const day = (now.getDay() + offset) % 7
    for (const s of slotsOn(market, day)) {
      const start = toMinutes(s.open)
      if (offset === 0 && start <= t) continue
      return { ...s, inDays: offset, minutesUntil: offset * 1440 + start - t }
    }
  }
  return null
}

/** Minutes until the market is next open: 0 when open now. Used for sorting. */
export function minutesUntilOpen(market, now = new Date()) {
  if (currentSlot(market, now)) return 0
  const next = nextOpening(market, now)
  return next ? next.minutesUntil : Infinity
}

const relDay = (inDays, day) => (inDays === 0 ? 'today' : inDays === 1 ? 'tomorrow' : DAYS[day])

/**
 * Human status for tags and details.
 *  { open, closingSoon, label, short }
 *  label: "Open now · until 13:00" | "Closed · opens Saturday 08:00"
 */
export function marketStatus(market, now = new Date()) {
  const slot = currentSlot(market, now)
  if (slot) {
    const left = toMinutes(slot.close) - minutesOf(now)
    return {
      open: true,
      closingSoon: left <= 45,
      label: left <= 45 ? `Open now · closes in ${left} min` : `Open now · until ${slot.close}`,
      short: 'Open now',
    }
  }
  const next = nextOpening(market, now)
  if (!next) return { open: false, closingSoon: false, label: 'Schedule to be confirmed', short: 'Closed' }
  const when = relDay(next.inDays, next.day)
  return {
    open: false,
    closingSoon: false,
    label: `Closed · opens ${when} ${next.open}`,
    short: `Opens ${when === 'today' || when === 'tomorrow' ? when : DAYS_SHORT[next.day]} ${next.open}`,
    next,
  }
}

/** "Sat 08:00–13:00 · Wed 15:00–19:00", Monday-first. */
export function scheduleSummary(market) {
  return WEEK_ORDER.flatMap((d) => slotsOn(market, d).map((s) => `${DAYS_SHORT[d]} ${s.open}–${s.close}`)).join(' · ')
}

/** Compact day list: "Sat & Wed" or "Every day". */
export function dayList(market) {
  const days = [...new Set(market.schedule.map((s) => s.day))]
  if (days.length === 7) return 'Every day'
  const ordered = WEEK_ORDER.filter((d) => days.includes(d)).map((d) => DAYS_SHORT[d])
  return ordered.length > 2 ? `${ordered.slice(0, -1).join(', ')} & ${ordered.at(-1)}` : ordered.join(' & ')
}
