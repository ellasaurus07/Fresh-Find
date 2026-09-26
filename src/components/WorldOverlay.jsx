import Icon from './Icon.jsx'
import FeaturedShowcase from './FeaturedShowcase.jsx'
import { SORTS } from '../lib/filters.js'
import { useApp } from '../lib/context.js'

export const ARCHIVE_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'markets', label: 'Markets' },
  { id: 'open', label: 'Open now' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'herbs', label: 'Herbs' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'other', label: 'Other' },
  { id: 'organic', label: 'Organic' },
]
// Wooden tags hanging on the vine orbit around the globe. Each one filters
// and unfolds straight into the archive.
// The angles put each tag level with its band on the globe (markets across the top, then
// fruits, vegetables, herbs, and dairy & eggs at the bottom), so a tag always sits next to
// the tiles it filters. Open now and Local farmers are market filters, so they flank the top.
const ORBIT_TAGS = [
  { id: 'all', label: 'All', a: 272 },
  { id: 'markets', label: 'Markets', a: 224 },
  { id: 'open', label: 'Open now', a: 316 },
  { id: 'fruits', label: 'Fruits', a: 190 },
  { id: 'vegetables', label: 'Vegetables', a: 14 },
  { id: 'organic', label: 'Organic', a: 40 },
  { id: 'herbs', label: 'Herbs', a: 146 },
  { id: 'nearby', label: 'Local farmers', a: 120 },
  { id: 'dairy', label: 'Dairy', a: 64 },
]

export default function WorldOverlay({ mode, onUnfold, onFold, onChip, onTagHover, filter, setFilter, count, highlights }) {
  const { reduced, geo } = useApp()
  const inArchive = mode === 'archive'
  return (
    <>
      {/* ---------- globe layer ---------- */}
      <div className={`globe-ui${mode === 'globe' ? ' is-on' : ''}`} aria-hidden={mode !== 'globe'}>
        <svg className="orbit" viewBox="-100 -100 200 200" aria-hidden="true">
          <ellipse className="orbit__vine" cx="0" cy="0" rx="92" ry="30" transform="rotate(-14)" />
          <ellipse className="orbit__vine orbit__vine--2" cx="0" cy="0" rx="84" ry="52" transform="rotate(22)" />
          <path className="orbit__dash" d="M-96 60 C -60 96, 60 96, 96 58" />
        </svg>
        <ul className="orbit-tags" aria-label="Explore by category">
          {ORBIT_TAGS.map((t, i) => (
            <li key={t.id} style={{ '--a': `${t.a}deg`, '--i': i }}>
              <button type="button" tabIndex={mode === 'globe' ? 0 : -1} onClick={() => onChip(t.id)} onPointerEnter={(e) => e.pointerType === 'mouse' && onTagHover?.(t.id)} onPointerLeave={() => onTagHover?.(null)} onFocus={() => onTagHover?.(t.id)} onBlur={() => onTagHover?.(null)} data-cursor="open">{t.label}</button>
            </li>
          ))}
        </ul>
        <div className="globe-ui__copy">
          <h2 className="globe-ui__title">Market globe</h2>
          <p className="globe-ui__lede">Every market and every crop across Qatar, gathered into one living sphere. Spin it, hover a tile, open anything.</p>
        </div>
        <p className="globe-ui__hint" aria-hidden="true">
          <span className="hint--desk">Drag to rotate · Scroll to unfold</span>
          <span className="hint--touch">Swipe to rotate · Tap explore markets to open</span>
        </p>
        <button type="button" className="btn btn--primary btn--lg globe-ui__explore" onClick={onUnfold} tabIndex={mode === 'globe' ? 0 : -1} data-cursor="open">
          <span>Explore markets</span><Icon name="arrow" />
        </button>
        <FeaturedShowcase items={highlights} reduced={reduced} className="globe-ui__showcase" />
      </div>

      {/* ---------- archive layer ---------- */}
      <div className={`archive-ui${inArchive ? ' is-on' : ''}`} aria-hidden={!inArchive}>
        <div className="archive-ui__sign">
          <div className="archive-ui__head">
            <img src="/assets/sprites/sprig-2.webp" alt="" />
            <h2>Local markets</h2>
            <p>Local people · fresh food · brighter days</p>
            <img src="/assets/sprites/sprig-2.webp" alt="" />
          </div>
          <div className="archive-ui__row">
          <form className="archive-ui__search" role="search" onSubmit={(e) => e.preventDefault()}>
            <Icon name="search" size={18} />
            <label className="sr-only" htmlFor="archive-q">Search markets, produce and neighbourhoods</label>
            <input id="archive-q" type="search" placeholder="Search markets, produce, neighbourhoods…" value={filter.q} tabIndex={inArchive ? 0 : -1}
              onChange={(e) => setFilter({ ...filter, q: e.target.value })} />
          </form>
            <label className="sort">
              <span>Sort</span>
              <select value={filter.sort} onChange={(e) => setFilter({ ...filter, sort: e.target.value })} tabIndex={inArchive ? 0 : -1}>
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}{s.id === 'near' && !geo.hasLocation ? ' (needs location)' : ''}</option>)}
              </select>
            </label>
          </div>
          <div className="archive-ui__controls">
            <div className="chips" role="group" aria-label="Show">
              {ARCHIVE_CHIPS.map((c) => (
                <button key={c.id} type="button" className={`chip${filter.chip === c.id ? ' is-on' : ''}`} aria-pressed={filter.chip === c.id} tabIndex={inArchive ? 0 : -1}
                  onClick={() => onChip(c.id)}>{c.label}</button>
              ))}
            </div>
          </div>
        </div>
        <p className="archive-ui__count" role="status">{count ? `${count} ${count === 1 ? 'result' : 'results'}` : 'Nothing matches — try another filter.'}</p>
        <div className="archive-ui__bottom">
          <button type="button" className="btn btn--quiet" onClick={onFold} tabIndex={inArchive ? 0 : -1} data-cursor="open">
            <Icon name="globe" size={18} /><span className="long">Return to globe</span><span className="short">Globe</span>
          </button>
          <a className="btn btn--primary" href="#/markets" tabIndex={inArchive ? 0 : -1}>
            <span className="long">Full market directory</span><span className="short">Directory</span><Icon name="arrow" size={18} />
          </a>
        </div>
        <p className="archive-ui__hint" aria-hidden="true">
          <span className="hint--desk">Scroll or drag to browse · arrow keys work too</span>
          <span className="hint--touch">Swipe to browse · tap explore to open</span>
        </p>
      </div>
    </>
  )
}
