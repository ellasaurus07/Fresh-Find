import { useState } from 'react'
import Icon from './Icon.jsx'
import { Sheet } from './UI.jsx'
import { MapPanel } from './Markets.jsx'
import { SITE, MARKETS, PRODUCE } from '../lib/data.js'
import { distanceKm, formatKm } from '../lib/geo.js'
import { useApp } from '../lib/context.js'

export function AboutPanel({ onClose }) {
  return (
    <Sheet title="About FreshFind" kicker="Fresh All Along" crumbs={[{ label: 'Home', to: '#/' }, { label: 'About us', to: '#/about' }]} onClose={onClose} className="sheet--about">
      <div className="about">
        <p className="about__mission">{SITE.mission}</p>
        <div className="about__why">
          <img src="/assets/sprites/market-stall.webp" alt="Illustration of a market stall with a striped awning" width="240" />
          <p>Market times used to live on flyers, community boards and word of mouth. FreshFind brings {MARKETS.length} markets and {PRODUCE.length} kinds of local produce into one place, so planning a visit takes a minute — and more of what you spend goes straight to the people who grew it.</p>
        </div>
        <ul className="values">
          {SITE.values.map((v) => <li key={v.title}><h2>{v.title}</h2><p>{v.text}</p></li>)}
        </ul>
        <section aria-labelledby="team-h">
          <h2 id="team-h">Syntax Terror Team</h2>
          <ul className="team">
            {SITE.team.map((t) => (
              <li key={t.name}>
                <img src={`/assets/sprites/${t.sprite}.webp`} alt="" width="84" />
                <strong>{t.name}</strong><span>{t.role}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="plat-h" className="platform">
          <h2 id="plat-h">How the platform works</h2>
          <ul>{SITE.platform.map((p) => <li key={p}><Icon name="leaf" size={16} />{p}</li>)}</ul>
        </section>
      </div>
    </Sheet>
  )
}

export function ContactPanel({ onClose }) {
  const { geo } = useApp()
  const [showMine, setShowMine] = useState(false)
  const c = SITE.contact
  const mine = showMine && geo.status === 'granted' && geo.coords
  const locate = () => { setShowMine(true); geo.request() }
  return (
    <Sheet title="Contact us" kicker="Questions, corrections, or a market to add" crumbs={[{ label: 'Home', to: '#/' }, { label: 'Contact', to: '#/contact' }]} onClose={onClose} className="sheet--contact">
      <div className="contact">
        <address className="contact__card">
          <img src="/assets/sprites/note-lined.webp" alt="" className="contact__paper" />
          <p><Icon name="pin" size={18} /><span>{c.address}</span></p>
          <p><Icon name="mail" size={18} /><a href={`mailto:${c.email}`}>{c.email}</a></p>
          <p><Icon name="phone" size={18} /><a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a></p>
          <p><Icon name="clock" size={18} /><span>{c.hours}<small>{c.response}</small></span></p>
          <p className="contact__growers">Growers and market organisers: we’d love to list you. Email us your market’s name, days, hours and a photo.</p>
        </address>
        <div className="contact__map">
          <div className="contact__maphead">
            <h2>{mine ? 'Your live location' : 'Find us'}</h2>
            <div className="contact__switch">
              <button type="button" className={`chip${!mine ? ' is-on' : ''}`} aria-pressed={!mine} onClick={() => setShowMine(false)}>FreshFind office</button>
              <button type="button" className={`chip${mine ? ' is-on' : ''}`} aria-pressed={!!mine} onClick={locate}>
                <Icon name="locate" size={14} /> {geo.status === 'locating' ? 'Locating…' : 'Show my location'}
              </button>
            </div>
          </div>
          {showMine && (geo.status === 'denied' || geo.status === 'unavailable') && (
            <p className="loc loc--denied" role="status">{geo.error} The map shows our office instead.</p>
          )}
          {mine
            ? <><MapPanel lat={geo.coords.lat} lng={geo.coords.lng} label="Your location" zoom={14} /><p className="block__lede">You are {formatKm(distanceKm(geo.coords, c))} from the FreshFind office.</p></>
            : <MapPanel lat={c.lat} lng={c.lng} label="FreshFind studio, Msheireb Downtown Doha" />}
        </div>
      </div>
    </Sheet>
  )
}
