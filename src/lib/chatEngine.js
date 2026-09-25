// ---------------------------------------------------------------------------
// FRESHBOT ENGINE — rule-based, no live AI. A typed message is normalised,
// scored against the keyword intents in chatbot.json, and entity-matched
// against market and produce names from the JSON data. "Handler" intents
// build their answer from that same static data (open now, in season …).
// ---------------------------------------------------------------------------
import { CHAT, MARKETS, PRODUCE, CATEGORIES, marketById, produceAtMarket, categoryLabel, seasonLabel, seasonalPicks, seasonOfMonth, monthName } from './data.js'
import { marketStatus, currentSlot, operatesOn, DAYS, scheduleSummary } from './schedule.js'
import { distanceKm, formatKm } from './geo.js'

const norm = (s) => ` ${s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim()} `

// simple singular forms so "tomato" finds "Tomatoes" and "apples" finds "Apples"
const stems = (name) => {
  const n = name.toLowerCase()
  const out = new Set([n])
  if (n.endsWith('oes')) out.add(n.slice(0, -2))
  if (n.endsWith('ies')) out.add(n.slice(0, -3) + 'y')
  if (n.endsWith('s')) out.add(n.slice(0, -1))
  n.split(/[ &]+/).filter((w) => w.length > 3).forEach((w) => { out.add(w); if (w.endsWith('s')) out.add(w.slice(0, -1)) })
  return [...out]
}
const PRODUCE_NAMES = PRODUCE.map((p) => ({ p, keys: [...stems(p.name), p.id.replace(/-/g, ' ')] }))
const MARKET_NAMES = MARKETS.map((m) => ({ m, keys: [m.name.toLowerCase(), m.area.toLowerCase(), m.id.replace(/-/g, ' ')] }))
const GENERIC = new Set(['market', 'markets', 'farmers', 'community', 'fresh', 'local', 'greens', 'street'])

function findProduce(text) {
  // most specific match first: "camel milk" beats "milk", "date syrup" beats "dates"
  const best = (keys) => Math.max(0, ...keys.filter((k) => !GENERIC.has(k) && text.includes(` ${k} `)).map((k) => k.length))
  return PRODUCE_NAMES.map((h) => ({ p: h.p, len: best(h.keys) })).filter((h) => h.len > 0).sort((a, b) => b.len - a.len).map((h) => h.p)
}
function findMarket(text) {
  // prefer full-name matches over area-name matches
  const full = MARKET_NAMES.find(({ m }) => text.includes(` ${m.name.toLowerCase()} `))
  if (full) return full.m
  const hit = MARKET_NAMES.find(({ keys }) => keys.slice(1).some((k) => text.includes(` ${k} `)))
  return hit ? hit.m : null
}

const link = (label, to) => ({ label, to })
const mLink = (m) => link(m.name, `#/markets/${m.id}`)
const pLink = (p) => link(p.name, `#/produce/${p.id}`)
const listJoin = (arr) => (arr.length <= 1 ? arr.join('') : `${arr.slice(0, -1).join(', ')} and ${arr.at(-1)}`)

const HANDLERS = {
  openToday(ctx) {
    const open = MARKETS.filter((m) => currentSlot(m, ctx.now))
    const today = MARKETS.filter((m) => operatesOn(m, ctx.now.getDay()) && !currentSlot(m, ctx.now))
    const t = ctx.now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    let text
    if (open.length) text = `Right now (${t}) ${open.length === 1 ? 'one market is' : `${open.length} markets are`} open: ${listJoin(open.map((m) => `${m.name} (until ${currentSlot(m, ctx.now).close})`))}.`
    else text = `Nothing is trading at ${t}, I’m afraid.`
    const later = today.filter((m) => marketStatus(m, ctx.now).next?.inDays === 0)
    if (later.length) text += ` Still to open today: ${listJoin(later.map((m) => `${m.name} at ${marketStatus(m, ctx.now).next.open}`))}.`
    if (!open.length && !later.length) {
      const soonest = [...MARKETS].sort((a, b) => (marketStatus(a, ctx.now).next?.inDays ?? 9) * 1440 - (marketStatus(b, ctx.now).next?.inDays ?? 9) * 1440)[0]
      text += ` The next to open is ${soonest.name} — ${marketStatus(soonest, ctx.now).label.replace('Closed · ', '')}.`
    }
    return { text, links: [...open.slice(0, 3).map(mLink), link('See every open market', '#/markets?open=1')] }
  },
  nearMe(ctx) {
    if (!ctx.coords) {
      return {
        text: 'I can sort markets by distance once I know roughly where you are. Share your location (it stays in your browser), or pick your neighbourhood instead.',
        action: 'locate',
        links: [link('Choose my neighbourhood', '#/markets?sort=near')],
      }
    }
    const sorted = [...MARKETS].sort((a, b) => distanceKm(ctx.coords, a) - distanceKm(ctx.coords, b)).slice(0, 3)
    return {
      text: `Closest to you: ${listJoin(sorted.map((m) => `${m.name} (${formatKm(distanceKm(ctx.coords, m))}, ${marketStatus(m, ctx.now).short.toLowerCase()})`))}.`,
      links: [...sorted.map(mLink), link('All markets by distance', '#/markets?sort=near')],
    }
  },
  inSeason(ctx) {
    const month = ctx.now.getMonth() + 1
    const season = seasonOfMonth(month)
    const picks = seasonalPicks(ctx.now, 5)
    return {
      text: `It’s ${season.name.toLowerCase()} — ${season.headline.toLowerCase()}. Fresh in ${monthName(month)}: ${listJoin(picks.map((p) => p.name.toLowerCase()))}.`,
      links: [...picks.slice(0, 3).map(pLink), link('Seasonal picks', '#/seasonal')],
    }
  },
  organic() {
    const markets = MARKETS.filter((m) => m.tags.includes('organic'))
    const produce = PRODUCE.filter((p) => p.organic)
    return {
      text: `${markets.length} markets have certified-organic growers — Al Waab Organic Market is organic-only. ${produce.length} items in the produce guide are commonly sold organic, including ${listJoin(produce.slice(0, 4).map((p) => p.name.toLowerCase()))}.`,
      links: [mLink(marketById['al-waab']), link('Organic markets', '#/markets?organic=1'), link('Produce guide', '#/produce')],
    }
  },
  category(ctx) {
    const cat = CATEGORIES.find((c) => ctx.text.includes(` ${c.id.replace(/s$/, '')}`)) ||
      (ctx.text.includes(' veg') ? CATEGORIES[1] : ctx.text.includes('cheese') ? CATEGORIES[3] : CATEGORIES[4])
    const markets = MARKETS.filter((m) => produceAtMarket[m.id].some((p) => p.category === cat.id))
    const items = PRODUCE.filter((p) => p.category === cat.id)
    return {
      text: `${cat.label}: ${items.length} kinds in the guide (${listJoin(items.slice(0, 4).map((p) => p.name.toLowerCase()))}…), sold at ${markets.length} markets including ${listJoin(markets.slice(0, 3).map((m) => m.name))}.`,
      links: [link(`Browse ${cat.label.toLowerCase()}`, `#/produce?cat=${cat.id}`), link(`Markets with ${cat.label.toLowerCase()}`, `#/markets?produce=${cat.id}`)],
    }
  },
  byDay(ctx) {
    const day = DAYS.findIndex((d) => ctx.text.includes(` ${d.toLowerCase()}`))
    const days = day >= 0 ? [day] : [5, 6] // Qatar's weekend: Friday + Saturday
    const ms = MARKETS.filter((m) => days.some((d) => operatesOn(m, d)))
    const label = day >= 0 ? `on ${DAYS[day]}` : 'at the weekend'
    return {
      text: `${ms.length} markets trade ${label}: ${listJoin(ms.map((m) => m.name))}.`,
      links: [link(`Filter markets ${label}`, `#/markets?day=${days[0]}`)],
    }
  },
}

function produceAnswer(p, ctx) {
  const ms = p.markets.map((id) => marketById[id])
  const month = ctx.now.getMonth() + 1
  const fresh = p.months.includes(month)
  return {
    text: `${p.name} (${categoryLabel(p.category).toLowerCase()}) — in season ${seasonLabel(p).toLowerCase()}${fresh ? ', so it’s in season right now' : ''}. You’ll find them at ${listJoin(ms.map((m) => m.name))}.`,
    links: [pLink(p), ...ms.slice(0, 2).map(mLink)],
  }
}
function marketAnswer(m, ctx) {
  const st = marketStatus(m, ctx.now)
  const items = produceAtMarket[m.id]
  let text = `${m.name}, ${m.area}: ${st.label.toLowerCase()}. Schedule: ${scheduleSummary(m)}.`
  if (ctx.coords) text += ` It’s ${formatKm(distanceKm(ctx.coords, m))}.`
  text += ` Typically on the stalls: ${listJoin(items.slice(0, 4).map((p) => p.name.toLowerCase()))}.`
  return { text, links: [mLink(m)] }
}

export function reply(input, ctx) {
  const text = norm(input)
  ctx = { ...ctx, text }
  // 1) named things beat generic intents
  const market = findMarket(text)
  const produce = findProduce(text)
  const hasWord = (k) => {
    const w = k.toLowerCase()
    // whole words only, so "this week" does not fire inside "this weekend"
    return text.includes(` ${w} `) || text.includes(` ${w}s `) || text.includes(` ${w}es `)
  }
  const scored = CHAT.intents
    .map((it) => ({ it, score: it.keywords.reduce((sum, k) => (hasWord(k) ? sum + k.split(' ').length : sum), 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
  const top = scored[0]?.it
  const topScore = scored[0]?.score || 0

  if (market && (!top || ['open_now', 'directions', 'timings', 'greeting', 'organic'].includes(top.id) || topScore < 2)) return marketAnswer(market, ctx)
  if (produce.length && (!top || !['bookmarks', 'notes', 'export', 'share', 'near_me', 'open_now'].includes(top.id))) return produceAnswer(produce[0], ctx)
  if (top) {
    if (top.handler && HANDLERS[top.handler]) return HANDLERS[top.handler](ctx)
    return { text: top.answer, links: top.links || [] }
  }
  return { text: CHAT.fallback, links: [link('Market directory', '#/markets'), link('Produce guide', '#/produce')] }
}
