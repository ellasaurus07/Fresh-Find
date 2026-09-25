import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GreenhouseEnvironment from './components/GreenhouseEnvironment.jsx'
import IntroScene from './components/IntroScene.jsx'
import MarketWorld from './components/MarketWorld.jsx'
import WorldOverlay from './components/WorldOverlay.jsx'
import FreshFindNavigation from './components/FreshFindNavigation.jsx'
import SearchOverlay from './components/SearchOverlay.jsx'
import Chatbot from './components/Chatbot.jsx'
import AuthDialog from './components/AuthDialog.jsx'
import BasketPanel from './components/BasketPanel.jsx'
import VisitorCounter from './components/VisitorCounter.jsx'
import { Toasts } from './components/UI.jsx'
import { MarketDirectory, MarketDetail } from './components/Markets.jsx'
import { ProduceGuide, ProduceDetail } from './components/Produce.jsx'
import SeasonalPicks from './components/SeasonalPicks.jsx'
import BookmarksPanel from './components/BookmarksPanel.jsx'
import { AboutPanel, ContactPanel } from './components/Info.jsx'
import useReducedMotion from './hooks/useReducedMotion.js'
import useNow from './hooks/useNow.js'
import useBookmarks from './hooks/useBookmarks.js'
import useBasket from './hooks/useBasket.js'
import useGeolocation from './hooks/useGeolocation.js'
import { AppCtx } from './lib/context.js'
import { useRoute, go } from './lib/router.js'
import { MARKETS, PRODUCE, produceAtMarket, categoryLabel, seasonLabel, seasonalPicks, weekNumber, CATEGORIES, inSeason } from './lib/data.js'
import { marketStatus, currentSlot, dayList, minutesUntilOpen } from './lib/schedule.js'
import { distanceKm, formatKm } from './lib/geo.js'
import { matchesText, sortMarkets } from './lib/filters.js'

const NEARBY_KM = 6
// The Market World (globe + archive) shows every item from the PRODUCE dataset —
// the same source of truth as the Produce Guide — grouped into bands purely for
// how they read on the sphere (see `tiles`). Nothing here is a curated subset.
const WORLD_BAND_ORDER = ['other', 'dairy', 'herbs', 'vegetables', 'fruits']
const BAND_RANK = Object.fromEntries(CATEGORIES.map((c) => [c.id, CATEGORIES.length - 1 - WORLD_BAND_ORDER.indexOf(c.id)]))
const catColour = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.colour]))
const SHEETS = new Set(['markets', 'produce', 'seasonal', 'saved', 'about', 'contact'])

export default function App() {
  const route = useRoute()
  const reduced = useReducedMotion()
  const now = useNow(30000)
  const bookmarks = useBookmarks()
  const basket = useBasket()
  const geo = useGeolocation()
  const [toasts, setToasts] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [auth, setAuth] = useState(null)
  const [basketOpen, setBasketOpen] = useState(false)
  const closeBasket = useCallback(() => {
    setBasketOpen(false)
  }, [])
  const [worldMode, setWorldMode] = useState('globe')
  const [entered, setEntered] = useState(() => route.section !== 'home')
  const [leaving, setLeaving] = useState(false)
  const [filter, setFilter] = useState({ chip: 'all', q: '', sort: 'next' })
  const worldRef = useRef(null)
  const worldSeen = useRef(route.section !== 'home') // has the visitor been inside the market yet?
  const flight = useRef(null) // { key, src, rect, id, kind }
  const [flightToken, setFlightToken] = useState(null)

  const section = route.section
  const home = section === 'home'
  const sheetOpen = SHEETS.has(section)
  if (!home && !entered) setEntered(true)

  /* ------------------------------ toasts ------------------------------ */
  const toast = useCallback((text, action = null) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t.slice(-2), { id, text, action }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  /* --------------------- tiles: one per market + produce --------------------- */
  const picks = useMemo(() => seasonalPicks(now, 6), [now])
  const featuredId = MARKETS[weekNumber(now) % MARKETS.length].id
  const tiles = useMemo(() => {
    const month = now.getMonth() + 1
    const pickIds = new Set(picks.map((p) => p.id))
    const nearest = geo.coords ? [...MARKETS].sort((a, b) => distanceKm(geo.coords, a) - distanceKm(geo.coords, b)).slice(0, 3).map((m) => m.id) : []
    const markets = MARKETS.map((m) => {
      const st = marketStatus(m, now)
      const km = geo.coords ? distanceKm(geo.coords, m) : null
      // Keep the market's category IDs as the source of truth for filtering.
      // The visible chips are a compact preview: Fruits + Vegetables + Dairy are
      // prioritised so dairy-selling markets are obvious at a glance.
      const marketCats = [...new Set(
  produceAtMarket[m.id].map((p) => p.category)
)]

const chipPriority = [
  'fruits',
  'vegetables',
  'dairy',
  'herbs',
  'other'
]

const marketChips = chipPriority
  .filter((cat) => marketCats.includes(cat))
  .map((cat) => categoryLabel(cat).split(' ')[0])
      const badge = st.open ? { text: 'Open now', tone: 'open' } : nearest.includes(m.id) ? { text: 'Nearby', tone: 'near' } : m.id === featuredId ? { text: 'Featured', tone: 'feat' } : null
      return {
        key: `m:${m.id}`, kind: 'market', id: m.id, href: `#/markets/${m.id}`, img: m.thumb, open: st.open,
        title: m.name, kicker: km != null ? `${m.area} · ${formatKm(km)}` : m.area, meta: st.open ? st.label.replace('Open now · ', 'Open ') : st.short, chips: marketChips, foot: dayList(m),
        badge, label: `${m.name}, ${m.area}. ${st.label}.`,
        previewTag: st.open ? 'Open now' : 'Closed', previewLines: [m.area + (km != null ? ` · ${formatKm(km)}` : ''), `${dayList(m)} · ${m.schedule[0].open}–${m.schedule[0].close}`, st.open ? st.label.replace('Open now · ', 'Open ') : st.label.replace('Closed · ', '')],
        near: km != null && km <= NEARBY_KM, organic: m.tags.includes('organic'), cats: marketCats, name: m.name, market: m,
      }
    })
    const produce = PRODUCE.map((p) => {
      const fresh = inSeason(p, month)
      return {
        key: `p:${p.id}`, kind: 'produce', id: p.id, href: `#/produce/${p.id}`, img: p.image, tint: catColour[p.category],
        title: p.name, kicker: categoryLabel(p.category), meta: `Season: ${seasonLabel(p)}`, chips: fresh ? ['In season'] : [], foot: `At ${p.markets.length} markets`,
        badge: pickIds.has(p.id) ? { text: 'Seasonal pick', tone: 'season' } : null,
        label: `${p.name}, ${categoryLabel(p.category)}, in season ${seasonLabel(p)}.`,
        previewTag: fresh ? 'In season' : 'Out of season', previewLines: [`Season: ${seasonLabel(p)}`, categoryLabel(p.category), `Sold at ${p.markets.length} markets`],
        organic: p.organic, cats: [p.category], name: p.name, produce: p, rank: BAND_RANK[p.category] ?? 4,
      }
    })
    // Tiles sit on the sphere in array order, index 0 at the bottom and the last index at the top.
    // Grouping them by category turns that into readable latitude bands that survive the
    // globe's spin, top to bottom: markets (photographs), fruits, vegetables, herbs, dairy & eggs,
    // other local produce — every item from the PRODUCE dataset fills the middle bands.
    const inCat = (cat) => produce.filter((t) => t.produce.category === cat).sort((a, b) => a.name.localeCompare(b.name))
    return [...WORLD_BAND_ORDER.flatMap(inCat), ...markets]
  }, [now, geo.coords, picks, featuredId])

  /* ------------------ archive order: filter chips + search + sort ------------------ */
  const order = useMemo(() => {
    const { chip, q, sort } = filter
    const s = q.trim().toLowerCase()
    const keep = tiles.filter((t) => {
      if (chip === 'markets' && t.kind !== 'market') return false
      if (chip === 'open' && !(t.kind === 'market' && t.open)) return false
      if (chip === 'nearby' && !(t.kind === 'market' && (geo.coords ? t.near : false))) return false
      if (['fruits', 'vegetables', 'herbs', 'dairy', 'other'].includes(chip) && !t.cats.includes(chip)) return false
      if (chip === 'organic' && !t.organic) return false
      if (s) {
        if (t.kind === 'market') return matchesText(t.market, s)
        return `${t.name} ${t.kicker} ${t.produce.description}`.toLowerCase().includes(s)
      }
      return true
    })
    const ms = sortMarkets(keep.filter((t) => t.kind === 'market').map((t) => t.market), sort, { now, origin: geo.coords }).map((m) => `m:${m.id}`)
    const ps = keep.filter((t) => t.kind === 'produce').sort((a, b) => (sort === 'az' ? a.name.localeCompare(b.name) : a.rank - b.rank)).map((t) => t.key)
    if (chip === 'all' && !s && sort !== 'az') {
      // weave markets through the produce so the wall reads like a market, not a spreadsheet
      const out = []
      let pi = 0
      ms.forEach((k) => { out.push(k); for (let j = 0; j < 2 && pi < ps.length; j += 1) out.push(ps[pi++]) })
      return [...out, ...ps.slice(pi)]
    }
    return [...ms, ...ps]
  }, [tiles, filter, now, geo.coords])

  const onChip = useCallback((chip) => {
    if (chip === 'nearby' && !geo.hasLocation) { geo.request(); toast('Share your location, or pick a neighbourhood in Markets, to see what’s nearby') }
    setFilter((f) => ({ ...f, chip, sort: chip === 'nearby' ? 'near' : f.sort }))
    if (worldRef.current?.getMode() === 'globe') worldRef.current.unfold()
  }, [geo, toast])

  /* ------------------------------ highlights ------------------------------ */
  const highlights = useMemo(() => {
    const out = []
    const open = sortMarkets(MARKETS.filter((m) => currentSlot(m, now)), 'next', { now })
    open.slice(0, 2).forEach((m) => out.push({ key: `o${m.id}`, kind: 'market', tone: 'open', label: 'Open now', title: m.name, sub: marketStatus(m, now).label.replace('Open now · ', 'Open '), href: `#/markets/${m.id}`, img: m.thumb }))
    if (geo.coords) {
      const n = [...MARKETS].sort((a, b) => distanceKm(geo.coords, a) - distanceKm(geo.coords, b))[0]
      out.push({ key: `n${n.id}`, kind: 'market', tone: 'near', label: 'Nearby', title: n.name, sub: `${formatKm(distanceKm(geo.coords, n))} · ${marketStatus(n, now).short}`, href: `#/markets/${n.id}`, img: n.thumb })
    }
    const f = MARKETS.find((m) => m.id === featuredId)
    out.push({ key: `f${f.id}`, kind: 'market', tone: 'feat', label: 'Featured', title: f.name, sub: marketStatus(f, now).label, href: `#/markets/${f.id}`, img: f.thumb })
    if (!open.length) {
      const soon = [...MARKETS].sort((a, b) => minutesUntilOpen(a, now) - minutesUntilOpen(b, now))[0]
      out.push({ key: `s${soon.id}`, kind: 'market', tone: 'soon', label: 'Opening next', title: soon.name, sub: marketStatus(soon, now).label.replace('Closed · ', ''), href: `#/markets/${soon.id}`, img: soon.thumb })
    }
    picks.slice(0, 3).forEach((p) => out.push({ key: `p${p.id}`, kind: 'produce', tone: 'season', label: 'Seasonal pick', title: p.name, sub: `In season ${seasonLabel(p)}`, href: `#/produce/${p.id}`, img: p.image }))
    return out
  }, [now, geo.coords, picks, featuredId])

  /* ------------------------------ navigation ------------------------------ */
  // One continuous camera move: the environment switches to the greenhouse at
  // once (plate zoom + fade, foliage passing by), the route changes early so the
  // globe assembles while the zoom is still travelling, and the intro stays
  // mounted until its sign has finished zooming away with the plate.
  const enterMarket = useCallback(() => {
    if (reduced) { go('#/explore'); return }
    setLeaving(true)
    setTimeout(() => go('#/explore'), 360)
    setTimeout(() => setLeaving(false), 1250)
  }, [reduced])
  useEffect(() => { if (section !== 'home') worldSeen.current = true }, [section])

  // Leaving the Market World any way other than "Return to globe" — most notably
  // clicking the FreshFind logo straight Home — must not leave the archive
  // unfolded behind the scenes. The world is fully hidden (opacity 0 / not
  // interactive) while `home` is true, so resetting it here is invisible: the
  // next "Enter the Market" always shows the closed globe again.
  useEffect(() => { if (home) worldRef.current?.resetClosed() }, [home])

  // ALL is the globe's resting state: whenever the world is (back) on the globe,
  // drop any archive filter/search so the sphere is never a filtered subset.
  const resetFilter = useCallback(() => setFilter((f) => (f.chip === 'all' && !f.q ? f : { ...f, chip: 'all', q: '', sort: f.sort === 'near' && !geo.coords ? 'next' : f.sort })), [geo.coords])
  useEffect(() => { if (worldMode === 'globe') resetFilter() }, [worldMode, resetFilter])
  const foldToGlobe = useCallback(() => { resetFilter(); worldRef.current?.fold() }, [resetFilter])

  const openTile = useCallback((tile, rect, src) => {
    flight.current = { key: tile.key, src, rect, id: tile.id, kind: tile.kind }
    setFlightToken({ ...flight.current })
    go(tile.href)
  }, [])

  const closeSheet = useCallback(() => {
    const f = flight.current
    const isDetail = !!route.id && (section === 'markets' || section === 'produce')
    if (isDetail && f && f.id === route.id) {
      // opened from the globe/archive: close straight back to where the visitor was
      flight.current = null
      go('#/explore')
      return
    }
    if (f) { worldRef.current?.hideTile(f.key, false); flight.current = null }
    if (isDetail) go(section === 'markets' ? '#/markets' : '#/produce')
    else go('#/explore')
  }, [route.id, section])

  // any other way out of a detail (breadcrumb, back button) un-hides the tile
  useEffect(() => {
    const f = flight.current
    if (f && !(route.id === f.id)) {
      if (section !== 'explore') { worldRef.current?.hideTile(f.key, false); flight.current = null }
    }
  }, [route.id, section])

  /* keyboard: "/" opens search anywhere */
  useEffect(() => {
    const on = (e) => {
      if (e.key === '/' && !e.target.closest('input,textarea,select,[contenteditable]')) { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])
  useEffect(() => { setSearchOpen(false) }, [route.path])

  // title + focus management across rooms
  useEffect(() => {
    const names = { home: 'Fresh All Along', explore: 'Explore', markets: 'Markets', produce: 'Produce guide', seasonal: 'Seasonal picks', saved: 'Saved', about: 'About', contact: 'Contact' }
    document.title = `FreshFind — ${names[section] || 'Fresh All Along'}`
  }, [section])

  // the world stays mounted but inert behind rooms
  const worldWrap = useRef(null)
  useEffect(() => { if (worldWrap.current) worldWrap.current.inert = home || sheetOpen }, [home, sheetOpen])

  const ctx = useMemo(() => ({ now, geo, bookmarks, basket, toast, reduced }), [now, geo, bookmarks, basket, toast, reduced])

  let sheet = null
  const flown = () => setFlightToken(null)
  if (section === 'markets') sheet = route.id
    ? <MarketDetail key={route.id} id={route.id} flight={flightToken?.id === route.id ? flightToken : null} onClose={closeSheet} onFlown={flown} />
    : <MarketDirectory query={route.query} onClose={closeSheet} />
  if (section === 'produce') sheet = route.id
    ? <ProduceDetail key={route.id} id={route.id} flight={flightToken?.id === route.id ? flightToken : null} onClose={closeSheet} onFlown={flown} />
    : <ProduceGuide query={route.query} onClose={closeSheet} />
  if (section === 'seasonal') sheet = <SeasonalPicks onClose={closeSheet} />
  if (section === 'saved') sheet = <BookmarksPanel onClose={closeSheet} />
  if (section === 'about') sheet = <AboutPanel onClose={closeSheet} />
  if (section === 'contact') sheet = <ContactPanel onClose={closeSheet} />

  return (
    <AppCtx.Provider value={ctx}>
      <a className="skip" href="#main-content" onClick={(e) => { e.preventDefault(); document.querySelector('.sheet__title, .intro__panel button, .globe-ui__explore, .archive-ui input')?.focus() }}>Skip to content</a>
      <div className={`app app--${home ? 'intro' : 'world'} app--${worldMode}${sheetOpen ? ' has-sheet' : ''}${leaving ? ' is-leaving' : ''}`}>
        <GreenhouseEnvironment scene={home && !leaving ? 'intro' : 'world'} dim={sheetOpen} reduced={reduced} />
        <FreshFindNavigation section={section} onSearch={() => setSearchOpen(true)} onAuth={setAuth} savedCount={bookmarks.count} basketCount={basket.count} onBasket={() => setBasketOpen(true)} />

        {(home || leaving) && <IntroScene onEnter={enterMarket} highlights={highlights} returning={home && worldSeen.current} leaving={leaving} />}

        {entered && (
          <div ref={worldWrap} className="world-wrap" id="main-content" aria-hidden={home || sheetOpen}>
            <h1 className="sr-only">FreshFind market world</h1>
            <MarketWorld
              ref={worldRef}
              tiles={tiles}
              order={order}
              active={!home && !sheetOpen && !searchOpen}
              reducedMotion={reduced}
              entering={!reduced}
              hasLocation={geo.hasLocation}
              onOpen={openTile}
              onModeChange={setWorldMode}
            />
            <WorldOverlay
              mode={worldMode}
              onUnfold={() => worldRef.current?.unfold()}
              onFold={foldToGlobe}
              onChip={onChip}
              onTagHover={(id) => worldRef.current?.setHighlight(id)}
              filter={filter}
              setFilter={setFilter}
              count={order.length}
              highlights={highlights}
            />
          </div>
        )}

        {sheet && <main className="sheet-layer" id="main">{sheet}</main>}

        <footer className="edge-foot">
          <VisitorCounter />
          <p>© FreshFind · a Qatar community market guide</p>
        </footer>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Chatbot />
      <AuthDialog mode={auth} onClose={() => setAuth(null)} onSwitch={setAuth} />
      <BasketPanel
        open={basketOpen}
        onClose={closeBasket}
      />
      <Toasts items={toasts} dismiss={dismiss} />
    </AppCtx.Provider>
  )
}
