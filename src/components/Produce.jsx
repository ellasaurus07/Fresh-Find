import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { Sheet, StatusPill, Distance, BookmarkButton, ShareButton, NoteField } from './UI.jsx'
import { NotFound } from './Markets.jsx'
import { PRODUCE, CATEGORIES, categoryLabel, seasonLabel, seasonsFor, produceById, marketsForProduce, MONTHS_SHORT, inSeason, isYearRound } from '../lib/data.js'
import { minutesUntilOpen } from '../lib/schedule.js'
import { distanceKm } from '../lib/geo.js'
import { useApp } from '../lib/context.js'
import { withQuery } from '../lib/router.js'
import { settleIn } from '../lib/flight.js'
import { freshnessFor, orderMetaFor } from '../lib/produceExtras.js'

const catColour = (id) => CATEGORIES.find((c) => c.id === id)?.colour || '#5e8f3a'

/** A seed packet: the Produce Guide's card. */
export function ProduceCard({ p, label }) {
  const { now } = useApp()
  const fresh = inSeason(p, now.getMonth() + 1)
  return (
    <article className="packet" style={{ '--cat': catColour(p.category) }}>
      <a href={`#/produce/${p.id}`} className="packet__link" data-cursor="view">
        <span className="packet__flap" aria-hidden="true" />
        {label && <span className="packet__label">{label}</span>}
        <span className="packet__art"><img src={p.image} alt={`Illustration of ${p.name.toLowerCase()}`} width="160" height="168" loading="lazy" /></span>
        <span className="packet__cat">{categoryLabel(p.category)}</span>
        <h3>{p.name}</h3>
        <span className="packet__season"><Icon name="calendar" size={14} />{seasonLabel(p)}</span>
        <span className="packet__foot">
          {fresh ? <span className="fresh-dot">{isYearRound(p) ? 'All year' : 'In season now'}</span> : <span className="fresh-dot fresh-dot--off">Out of season</span>}
          <span>{p.markets.length} markets</span>
        </span>
      </a>
      <BookmarkButton type="produce" id={p.id} name={p.name} compact />
    </article>
  )
}

export function ProduceGuide({ query, onClose }) {
  const { now } = useApp()
  const [cat, setCat] = useState(query.cat || 'all')
  const [fresh, setFresh] = useState(query.fresh === '1')
  const [q, setQ] = useState('')
  useEffect(() => { setCat(query.cat || 'all') }, [query.cat])
  useEffect(() => {
    const to = withQuery('#/produce', { cat: cat === 'all' ? '' : cat, fresh: fresh ? '1' : '' })
    if (window.location.hash !== to) history.replaceState(null, '', to)
  }, [cat, fresh])
  const month = now.getMonth() + 1
  const list = useMemo(() => PRODUCE.filter((p) =>
    (cat === 'all' || p.category === cat) &&
    (!fresh || inSeason(p, month)) &&
    (!q.trim() || `${p.name} ${p.description}`.toLowerCase().includes(q.trim().toLowerCase()))
  ), [cat, fresh, q, month])
  const count = (id) => PRODUCE.filter((p) => id === 'all' || p.category === id).length
  const crumbs = [{ label: 'Home', to: '#/' }, { label: 'Produce guide', to: '#/produce' }]
  if (cat !== 'all') crumbs.push({ label: categoryLabel(cat), to: `#/produce?cat=${cat}` })
  return (
    <Sheet title="Produce guide" kicker="Know what’s growing, and where to find it" crumbs={crumbs} onClose={onClose} className="sheet--produce">
      <div className="guide">
        <div className="guide__bar">
          <div className="tabs" role="tablist" aria-label="Produce categories">
            {[{ id: 'all', label: 'Everything' }, ...CATEGORIES].map((c) => (
              <button key={c.id} role="tab" type="button" aria-selected={cat === c.id} className={cat === c.id ? 'is-on' : ''} onClick={() => setCat(c.id)} style={{ '--cat': c.colour || '#23412a' }}>
                {c.label} <small>{count(c.id)}</small>
              </button>
            ))}
          </div>
          <div className="guide__tools">
            <label className="toggle"><input type="checkbox" checked={fresh} onChange={(e) => setFresh(e.target.checked)} /><span>In season now</span></label>
            <label className="field field--search field--inline">
              <span className="sr-only">Search produce</span>
              <Icon name="search" size={16} />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search produce…" />
            </label>
          </div>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{list.length} items shown</p>
        {list.length ? (
          <div className="packets" role="tabpanel" aria-label={cat === 'all' ? 'All produce' : categoryLabel(cat)}>
            {list.map((p) => <ProduceCard key={p.id} p={p} />)}
          </div>
        ) : (
          <div className="empty"><p>Nothing in this category is in season right now. Turn off “In season now” to see everything.</p></div>
        )}
      </div>
    </Sheet>
  )
}

export function SeasonStrip({ p, month }) {
  return (
    <ol className="strip" aria-label={`In season: ${seasonLabel(p)}`}>
      {MONTHS_SHORT.map((mn, i) => {
        const on = p.months.includes(i + 1)
        return (
          <li key={mn} className={`${on ? 'is-on' : ''}${i + 1 === month ? ' is-now' : ''}`}>
            <span aria-hidden="true">{mn[0]}</span>
            <span className="sr-only">{mn}: {on ? 'in season' : 'out of season'}{i + 1 === month ? ' (this month)' : ''}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function ProduceDetail({ id, flight, onClose, onFlown }) {
  const { now, geo, reduced, basket, toast } = useApp()
  const p = produceById[id]
  const artRef = useRef(null)
  const [orderMarketId, setOrderMarketId] = useState('')
  useEffect(() => { setOrderMarketId(p?.markets?.[0] || '') }, [id, p])
  useLayoutEffect(() => {
    if (!flight || !artRef.current) return
    settleIn(artRef.current, flight.rect, { reduced }).then(() => onFlown?.())
  }, [flight]) // eslint-disable-line
  if (!p) return <NotFound onClose={onClose} what="item" />
  const month = now.getMonth() + 1
  const markets = [...marketsForProduce(p)].sort((a, b) =>
    geo.coords ? distanceKm(geo.coords, a) - distanceKm(geo.coords, b) : minutesUntilOpen(a, now) - minutesUntilOpen(b, now))
  const related = PRODUCE.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)
  const freshness = freshnessFor(p)
  const orderMeta = orderMetaFor(p)
  return (
    <Sheet
      title={p.name}
      kicker={`${categoryLabel(p.category)} · ${seasonsFor(p).join(', ')}`}
      crumbs={[{ label: 'Home', to: '#/' }, { label: 'Produce guide', to: '#/produce' }, { label: categoryLabel(p.category), to: `#/produce?cat=${p.category}` }, { label: p.name, to: `#/produce/${p.id}` }]}
      onClose={onClose}
      className="sheet--detail sheet--produce-detail"
      actions={<><BookmarkButton type="produce" id={p.id} name={p.name} /><ShareButton title={`${p.name} on FreshFind`} text={`${p.name} are in season ${seasonLabel(p)} — here’s where to find them:`} hash={`#/produce/${p.id}`} /></>}
    >
      <div className="detail">
        <div className="detail__media">
          <div className="big-packet" style={{ '--cat': catColour(p.category) }}>
            <img ref={artRef} data-hero src={p.image} alt={`Illustration of ${p.name.toLowerCase()}`} width="320" height="336" />
            <span className="big-packet__name">{p.name}</span>
            {p.organic && <span className="big-packet__organic">Often organic</span>}
          </div>
          <NoteField type="produce" id={p.id} name={p.name} />
        </div>
        <div className="detail__info">
          <section className="block">
            <h2 className="sr-only">About</h2>
            <p className="block__big">{p.description}</p>
            <p className="tip"><img src="/assets/sprites/sprig-1.webp" alt="" width="28" /> <span><strong>Market tip: </strong>{p.tip}</span></p>
          </section>
          <section className="block fresh-order" aria-labelledby="order-h">
            <div className="fresh-order__head">
              <div>
                <p className="fresh-order__eyebrow">Fresh Basket · demo ordering</p>
                <h2 id="order-h">Add to your market basket</h2>
              </div>
              <strong className="fresh-order__price">QAR {orderMeta.price}<small> / {orderMeta.unit}</small></strong>
            </div>
            <div className="fresh-order__controls">
              <label className="field">
                <span>Order from</span>
                <select value={orderMarketId} onChange={(e) => setOrderMarketId(e.target.value)}>
                  {markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </label>
              <button type="button" className="btn btn--primary" disabled={!orderMarketId} onClick={() => {
                basket.add(p.id, orderMarketId, 1)
                const market = markets.find((m) => m.id === orderMarketId)
                toast(`${p.name} added to Fresh Basket${market ? ` from ${market.name}` : ''}`)
              }}>
                <Icon name="basket" size={18} /> Add to Fresh Basket
              </button>
            </div>
            <p className="basket-demo">Illustrative price and order flow only — no real inventory or payment is processed.</p>
          </section>
          <section className="block" aria-labelledby="season-h">
            <h2 id="season-h">Typical season</h2>
            <p className="block__lede">{seasonLabel(p)}{inSeason(p, month) ? ' — in season right now.' : ' — not in season this month.'}</p>
            <SeasonStrip p={p} month={month} />
          </section>
          <section className="block keep-fresh" aria-labelledby="fresh-h">
            <div className="keep-fresh__title">
              <span className="keep-fresh__mark"><Icon name="leaf" size={20} /></span>
              <div><p>Care guide</p><h2 id="fresh-h">Keep it fresh</h2></div>
            </div>
            <div className="keep-fresh__grid">
              <article><strong>Store it</strong><p>{freshness.storage}</p></article>
              <article><strong>Best used</strong><p>{freshness.best}</p></article>
              <article><strong>Freshness tip</strong><p>{freshness.tip}</p></article>
              <article><strong>Watch for</strong><p>{freshness.watch}</p></article>
            </div>
            <p className="keep-fresh__note">General guidance only — always follow package storage and use-by instructions where provided.</p>
          </section>

          <section className="block" aria-labelledby="where-h">
            <h2 id="where-h">Where to find it</h2>
            <ul className="where">
              {markets.map((m) => (
                <li key={m.id}>
                  <a href={`#/markets/${m.id}`} data-cursor="open">
                    <img src={m.thumb} alt="" width="72" height="54" loading="lazy" />
                    <span><strong>{m.name}</strong><small>{m.area} <Distance market={m} /></small></span>
                    <StatusPill market={m} />
                  </a>
                </li>
              ))}
            </ul>
          </section>
          {related.length > 0 && (
            <section className="block" aria-labelledby="rel-h">
              <h2 id="rel-h">More {categoryLabel(p.category).toLowerCase()}</h2>
              <ul className="avail__grid">
                {related.map((r) => <li key={r.id}><a href={`#/produce/${r.id}`}><img src={r.image} alt="" width="64" height="64" loading="lazy" /><span>{r.name}</span></a></li>)}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Sheet>
  )
}
