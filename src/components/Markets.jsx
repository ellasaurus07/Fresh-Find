import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { Sheet, StatusPill, Distance, BookmarkButton, ShareButton, NoteField } from './UI.jsx'
import { FilterSelects } from './QuickFind.jsx'
import { MARKETS, AREAS, produceAtMarket, categoryLabel, CATEGORIES, marketById } from '../lib/data.js'
import { filterMarkets, sortMarkets, SORTS } from '../lib/filters.js'
import { DAYS, WEEK_ORDER, slotsOn, currentSlot, dayList, scheduleSummary, marketStatus } from '../lib/schedule.js'
import { distanceKm, formatKm, mapsEmbed, mapsLink, directionsLink } from '../lib/geo.js'
import { useApp } from '../lib/context.js'
import { go, withQuery } from '../lib/router.js'
import { settleIn } from '../lib/flight.js'
import { orderMetaFor } from '../lib/produceExtras.js'

/* ------------------------------------------------------------------ */
/* Location status + manual fallback (works when permission is denied) */
/* ------------------------------------------------------------------ */
export function LocationBar() {
  const { geo } = useApp()
  const picker = (
    <label className="loc__pick">
      <span className="sr-only">Plan from a neighbourhood</span>
      <select value={geo.area || ''} onChange={(e) => geo.setManual(e.target.value || null)}>
        <option value="">Choose a neighbourhood…</option>
        {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
    </label>
  )
  let body
  if (geo.status === 'granted') {
    body = geo.outsideRegion
      ? <><Icon name="locate" size={16} /><span>You seem to be outside Qatar, so distances are long. Plan from a neighbourhood instead?</span>{picker}</>
      : <><Icon name="locate" size={16} /><span>Using your location — nearby markets are marked.</span><button type="button" className="text-btn" onClick={() => geo.setManual(null)}>Stop</button></>
  } else if (geo.status === 'manual') {
    body = <><Icon name="pin" size={16} /><span>Planning from <strong>{geo.area}</strong>.</span>{picker}<button type="button" className="text-btn" onClick={geo.request}>Use my real location</button></>
  } else if (geo.status === 'locating') {
    body = <><span className="spinner" aria-hidden="true" /><span>Finding your location…</span></>
  } else if (geo.status === 'denied' || geo.status === 'unavailable') {
    body = <><Icon name="pin" size={16} /><span>{geo.error} No problem — pick a neighbourhood to sort by distance:</span>{picker}</>
  } else {
    body = <><Icon name="locate" size={16} /><span>See distances and markets near you.</span><button type="button" className="btn btn--small btn--primary" onClick={geo.request}>Use my location</button><span className="loc__or">or</span>{picker}</>
  }
  return <div className={`loc loc--${geo.status}`} role="status">{body}</div>
}

/* ------------------------------------------------------------------ */
/* Map: an embedded Google map, with a plain link as a fallback         */
/* ------------------------------------------------------------------ */
export function MapPanel({ lat, lng, label, zoom = 15 }) {
  return (
    <figure className="map">
      <div className="map__frame">
        <iframe title={`Map showing ${label}`} src={mapsEmbed(lat, lng, zoom)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <span className="map__pin" aria-hidden="true"><Icon name="pin" size={28} /></span>
      </div>
      <figcaption>
        <a href={mapsLink(lat, lng, label)} target="_blank" rel="noopener noreferrer">Open in Google Maps <Icon name="arrow" size={14} /></a>
      </figcaption>
    </figure>
  )
}

/* Simplified Gulf coastline around Doha (lat, lng), north to south, and The Pearl
   island — projected with the same function as the market pins. */
const COAST = [[25.46, 51.522], [25.4, 51.525], [25.375, 51.535], [25.355, 51.528], [25.33, 51.528], [25.315, 51.527], [25.302, 51.521], [25.296, 51.535], [25.29, 51.556], [25.27, 51.582], [25.25, 51.606], [25.2, 51.607], [25.168, 51.608], [25.12, 51.61]]
// label side ('l' | 'r') and vertical nudge for pins that sit close together in central Doha
const LABEL = { 'the-pearl': ['r', -2], katara: ['l', 4], 'old-airport': ['r', 2], 'al-waab': ['l', 4], 'al-sadd': ['r', 12], 'abu-hamour': ['l', 7], 'madinat-khalifa': ['l', -9], 'al-thumama': ['r', 4], 'al-wakrah': ['l', 0] }
const PEARL = [[25.382, 51.543], [25.378, 51.556], [25.365, 51.559], [25.36, 51.548], [25.367, 51.54]]

/* A hand-drawn neighbourhood map of every market, drawn from the JSON coordinates. */
export function MiniMap({ markets, highlight = [], compact = false }) {
  const { geo, now } = useApp()
  const lats = MARKETS.map((m) => m.lat), lngs = MARKETS.map((m) => m.lng)
  const box = { a: Math.min(...lats) - 0.012, b: Math.max(...lats) + 0.012, c: Math.min(...lngs) - 0.02, d: Math.max(...lngs) + 0.02 }
  const px = (p) => [((p.lng - box.c) / (box.d - box.c)) * 300, (1 - (p.lat - box.a) / (box.b - box.a)) * 200]
  const shown = new Set(markets.map((m) => m.id))
  const me = geo.coords && geo.coords.lat > box.a && geo.coords.lat < box.b && geo.coords.lng > box.c && geo.coords.lng < box.d ? px(geo.coords) : null
  return (
    <figure className={`minimap${compact ? ' minimap--compact' : ''}`}>
      <svg viewBox="0 0 300 200" role="img" aria-label={`Map of Doha and nearby areas showing ${markets.length} markets`}>
        <rect width="300" height="200" rx="14" className="minimap__land" />
        <ellipse className="minimap__park" cx={px({ lat: 25.262, lng: 51.442 })[0]} cy={px({ lat: 25.262, lng: 51.442 })[1]} rx="16" ry="10" />
        <path className="minimap__sea" d={`M${COAST.map((c) => px({ lat: c[0], lng: c[1] }).map((v) => v.toFixed(1)).join(' ')).join(' L')} L320 220 L320 -20 Z`} />
        <path className="minimap__sea minimap__island" d={`M${PEARL.map((c) => px({ lat: c[0], lng: c[1] }).map((v) => v.toFixed(1)).join(' ')).join(' L')} Z`} />
        <path className="minimap__road" d="M0 70h300M150 0v200M40 200 260 0" />
        {MARKETS.map((m) => {
          const [x, y] = px(m)
          const on = shown.has(m.id)
          const open = !!currentSlot(m, now)
          return (
            <a key={m.id} href={`#/markets/${m.id}`} aria-label={`${m.name}${open ? ', open now' : ''}`} className={`minimap__m${on ? '' : ' is-off'}${open ? ' is-open' : ''}${highlight.includes(m.id) ? ' is-hl' : ''}`}>
              <circle cx={x} cy={y} r={on ? 7 : 4} />
              {on && !compact && (() => {
                const [side, dy] = LABEL[m.id] || [x > 200 ? 'l' : 'r', 0]
                return <text x={side === 'l' ? x - 10 : x + 10} y={y + 4 + dy} textAnchor={side === 'l' ? 'end' : 'start'}>{m.area}</text>
              })()}
            </a>
          )
        })}
        {me && <g className="minimap__me"><circle cx={me[0]} cy={me[1]} r="10" /><circle cx={me[0]} cy={me[1]} r="4" /></g>}
      </svg>
      <figcaption><i className="k-open" /> open now <i className="k-closed" /> closed {me && <><i className="k-me" /> you</>}</figcaption>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Market card (directory list)                                        */
/* ------------------------------------------------------------------ */
export function MarketCard({ market }) {
  const items = produceAtMarket[market.id]
  return (
    <article className="mcard">
      <a href={`#/markets/${market.id}`} className="mcard__link" data-cursor="open">
        <span className="mcard__img"><img src={market.thumb} alt={`Stalls at ${market.name}`} width="360" height="270" loading="lazy" /></span>
        <span className="mcard__body">
          <StatusPill market={market} />
          <h3>{market.name}</h3>
          <span className="mcard__where"><Icon name="pin" size={15} />{market.area}<Distance market={market} /></span>
          <span className="mcard__when"><Icon name="calendar" size={15} />{scheduleSummary(market)}</span>
          <span className="mcard__desc">{market.description}</span>
          <span className="mcard__produce" aria-label={`Typically sells ${items.slice(0, 5).map((p) => p.name).join(', ')}`}>
            {items.slice(0, 6).map((p) => <img key={p.id} src={p.image} alt="" title={p.name} width="30" height="30" loading="lazy" />)}
            {items.length > 6 && <small>+{items.length - 6}</small>}
          </span>
        </span>
      </a>
      <BookmarkButton type="market" id={market.id} name={market.name} compact />
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* MARKET DIRECTORY                                                    */
/* ------------------------------------------------------------------ */
const readFilters = (q) => ({
  area: q.area || '', day: q.day ?? '', produce: q.produce || '', q: q.q || '',
  open: q.open === '1', organic: q.organic === '1', sort: q.sort || 'next',
})

export function MarketDirectory({ query, onClose }) {
  const { now, geo } = useApp()
  const [f, setF] = useState(() => readFilters(query))
  const [narrow] = useState(() => window.matchMedia('(max-width: 900px)').matches)
  const qKey = JSON.stringify(query)
  useEffect(() => { setF(readFilters(query)) }, [qKey]) // links from FreshBot / Quick Find
  useEffect(() => {
    const to = withQuery('#/markets', { area: f.area, day: f.day, produce: f.produce, q: f.q, open: f.open ? '1' : '', organic: f.organic ? '1' : '', sort: f.sort === 'next' ? '' : f.sort })
    if (window.location.hash !== to) history.replaceState(null, '', to)
  }, [f])
  useEffect(() => { if (f.sort === 'near' && geo.status === 'idle') geo.request() }, [f.sort]) // eslint-disable-line

  const list = useMemo(() => {
    const filtered = filterMarkets(MARKETS, { ...f, openNow: f.open }, now)
    return sortMarkets(filtered, f.sort, { now, origin: geo.coords })
  }, [f, now, geo.coords])
  const active = f.area || f.day !== '' || f.produce || f.q || f.open || f.organic
  const openCount = list.filter((m) => currentSlot(m, now)).length

  return (
    <Sheet
      title="Market directory"
      kicker={`${MARKETS.length} farmers markets across Qatar`}
      crumbs={[{ label: 'Home', to: '#/' }, { label: 'Markets', to: '#/markets' }]}
      onClose={onClose}
      className="sheet--directory"
    >
      <div className="dir">
        <aside className="dir__side">
          <details className="filters-wrap" open={!narrow}>
          <summary><Icon name="filter" size={18} /> Filters{active ? ' · on' : ''}</summary>
          <form className="filters" role="search" aria-label="Filter markets" onSubmit={(e) => e.preventDefault()}>
            <label className="field field--search">
              <span>Search</span>
              <input type="search" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Name, produce, neighbourhood…" />
            </label>
            <FilterSelects value={f} onChange={(v) => setF({ ...f, ...v })} idBase="dir" />
            <div className="toggles">
              <label className="toggle"><input type="checkbox" checked={f.open} onChange={(e) => setF({ ...f, open: e.target.checked })} /><span>Open right now</span></label>
              <label className="toggle"><input type="checkbox" checked={f.organic} onChange={(e) => setF({ ...f, organic: e.target.checked })} /><span>Organic growers</span></label>
            </div>
            {active && <button type="button" className="text-btn" onClick={() => setF({ ...readFilters({}), sort: f.sort })}>Clear filters</button>}
          </form>
          </details>
          <MiniMap markets={list} />
        </aside>
        <div className="dir__main">
          <LocationBar />
          <div className="dir__bar">
            <p className="dir__count" role="status" aria-live="polite">
              <strong>{list.length}</strong> {list.length === 1 ? 'market' : 'markets'}{active ? ' match' : ''} · {openCount} open now
            </p>
            <div className="seg" role="radiogroup" aria-label="Sort markets">
              {SORTS.map((s) => (
                <button key={s.id} type="button" role="radio" aria-checked={f.sort === s.id} className={f.sort === s.id ? 'is-on' : ''} onClick={() => setF({ ...f, sort: s.id })}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {f.sort === 'near' && !geo.hasLocation && <p className="dir__note">Sorting by distance needs a location — until then, markets are listed by next opening.</p>}
          {list.length === 0 ? (
            <div className="empty">
              <img src="/assets/sprites/note-heart.webp" alt="" width="120" />
              <p>No market matches all of those. Try “Any day”, or clear the produce filter.</p>
              <button type="button" className="btn btn--quiet" onClick={() => setF(readFilters({}))}>Clear filters</button>
            </div>
          ) : (
            <div className="mgrid">{list.map((m) => <MarketCard key={m.id} market={m} />)}</div>
          )}
        </div>
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ */
/* MARKET DETAIL                                                       */
/* ------------------------------------------------------------------ */
const TAG_LABEL = { organic: 'Organic growers', outdoor: 'Open air', indoor: 'Under cover', family: 'Family friendly', evening: 'Evening market' }

export function MarketDetail({ id, flight, onClose, onFlown }) {
  const { now, geo, reduced, basket, toast } = useApp()
  const m = marketById[id]
  const [hero, setHero] = useState(0)
  const heroRef = useRef(null)
  useEffect(() => setHero(0), [id])
  // the tile the visitor clicked flies into this hero
  useLayoutEffect(() => {
    if (!flight || !heroRef.current) return
    settleIn(heroRef.current, flight.rect, { reduced }).then(() => onFlown?.())
  }, [flight]) // eslint-disable-line
  if (!m) return <NotFound onClose={onClose} what="market" />
  const st = marketStatus(m, now)
  const items = produceAtMarket[m.id]
  const today = now.getDay()
  const km = geo.coords ? distanceKm(geo.coords, m) : null
  const idx = MARKETS.findIndex((x) => x.id === m.id)
  const next = MARKETS[(idx + 1) % MARKETS.length]
  const byCat = CATEGORIES.map((c) => ({ ...c, items: items.filter((p) => p.category === c.id) })).filter((c) => c.items.length)

  return (
    <Sheet
      title={m.name}
      kicker={`${m.area} · ${dayList(m)}`}
      crumbs={[{ label: 'Home', to: '#/' }, { label: 'Markets', to: '#/markets' }, { label: m.name, to: `#/markets/${m.id}` }]}
      onClose={onClose}
      className="sheet--detail"
      actions={
        <>
          <BookmarkButton type="market" id={m.id} name={m.name} />
          <ShareButton title={m.name} text={`${m.name} — ${scheduleSummary(m)}. Found on FreshFind:`} hash={`#/markets/${m.id}`} />
          <a className="btn btn--primary btn--small" href={directionsLink(m.lat, m.lng, geo.status === 'granted' ? geo.coords : null)} target="_blank" rel="noopener noreferrer">
            <span>Get directions</span><Icon name="arrow" size={16} />
          </a>
        </>
      }
    >
      <div className="detail">
        <div className="detail__media">
          <div className="detail__hero">
            <img ref={heroRef} data-hero src={hero === 0 ? m.image : m.gallery[hero]} alt={`${m.name}: market stalls in ${m.area}`} width="720" height="540" />
            <StatusPill market={m} long />
          </div>
          <div className="detail__thumbs" role="group" aria-label="Photos">
            {m.gallery.map((g, i) => (
              <button key={g} type="button" className={hero === i ? 'is-on' : ''} onClick={() => setHero(i)} aria-label={`Show photo ${i + 1} of ${m.gallery.length}`} aria-pressed={hero === i}>
                <img src={g.replace('.webp', '-sm.webp')} alt="" loading="lazy" />
              </button>
            ))}
          </div>
          <NoteField type="market" id={m.id} name={m.name} />
        </div>

        <div className="detail__info">
          <dl className="facts">
            <div><dt><Icon name="pin" size={18} />Location</dt><dd>{m.address}{km != null && <small>{formatKm(km)}</small>}</dd></div>
            <div><dt><Icon name="clock" size={18} />Right now</dt><dd>{st.label}</dd></div>
            <div><dt><Icon name="basket" size={18} />Stalls</dt><dd>About {m.stalls} growers · since {m.established}</dd></div>
          </dl>

          <section className="block" aria-labelledby="about-h">
            <h2 id="about-h">About the market</h2>
            <p>{m.about}</p>
            <ul className="tags">{m.tags.map((t) => <li key={t}>{TAG_LABEL[t] || t}</li>)}</ul>
          </section>

          <section className="block" aria-labelledby="sched-h">
            <h2 id="sched-h">Weekly schedule</h2>
            <table className="schedule">
              <caption className="sr-only">Opening days and hours for {m.name}</caption>
              <thead><tr><th scope="col">Day</th><th scope="col">Hours</th></tr></thead>
              <tbody>
                {WEEK_ORDER.map((d) => {
                  const slots = slotsOn(m, d)
                  const isToday = d === today
                  return (
                    <tr key={d} className={`${isToday ? 'is-today' : ''}${slots.length ? '' : ' is-closed'}`}>
                      <th scope="row">{DAYS[d]}{isToday && <small> today</small>}</th>
                      <td>
                        {slots.length ? slots.map((s) => `${s.open} – ${s.close}`).join(', ') : 'Closed'}
                        {isToday && currentSlot(m, now) && <span className="schedule__now">Open now</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>

          <section className="block" aria-labelledby="prod-h">
            <h2 id="prod-h">Typically available</h2>
            {byCat.map((c) => (
              <div key={c.id} className="avail">
                <h3>{c.label}</h3>
                <ul className="avail__grid">
                  {c.items.map((p) => {
                    const meta = orderMetaFor(p)
                    return (
                      <li key={p.id} className="avail__item">
                        <a href={`#/produce/${p.id}`} data-cursor="view">
                          <img src={p.image} alt="" width="64" height="64" loading="lazy" />
                          <span>{p.name}</span>
                        </a>
                        <div className="avail__buy">
                          <small>QAR {meta.price}</small>
                          <button type="button" onClick={() => { basket.add(p.id, m.id, 1); toast(`${p.name} added to Fresh Basket from ${m.name}`) }}>+ Add</button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </section>

          <section className="block" aria-labelledby="map-h">
            <h2 id="map-h">Find it</h2>
            <p className="block__lede">{m.address}{km != null && ` — ${formatKm(km)}`}</p>
            <MapPanel lat={m.lat} lng={m.lng} label={m.name} />
          </section>

          <a className="next-link" href={`#/markets/${next.id}`}>
            <span>Next market</span><strong>{next.name}</strong><Icon name="arrow" />
          </a>
        </div>
      </div>
    </Sheet>
  )
}

export function NotFound({ onClose, what }) {
  return (
    <Sheet title={`We couldn’t find that ${what}`} onClose={onClose} crumbs={[{ label: 'Home', to: '#/' }]}>
      <div className="empty">
        <img src="/assets/sprites/note-cream.webp" alt="" width="120" />
        <p>The link may be out of date. Try the directory or the produce guide instead.</p>
        <a className="btn btn--primary" href="#/markets"><span>Market directory</span></a>
      </div>
    </Sheet>
  )
}
