import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import Clock from './Clock.jsx'
import { LeafMark } from './IntroScene.jsx'
import { useApp } from '../lib/context.js'

const LINKS = [
  { id: 'explore', label: 'Explore', to: '#/explore', icon: 'globe' },
  { id: 'markets', label: 'Markets', to: '#/markets', icon: 'pin' },
  { id: 'produce', label: 'Produce', to: '#/produce', icon: 'basket' },
  { id: 'seasonal', label: 'Seasonal', to: '#/seasonal', icon: 'sprout' },
  { id: 'saved', label: 'Saved', to: '#/saved', icon: 'heart' },
]
const MORE = [
  { id: 'about', label: 'About us', to: '#/about' },
  { id: 'contact', label: 'Contact', to: '#/contact' },
]

function MoreMenu({ section, onAuth }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const out = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus() } }
    document.addEventListener('pointerdown', out)
    window.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', out); window.removeEventListener('keydown', esc) }
  }, [open])
  return (
    <li className="rail__more" ref={ref}>
      <button type="button" aria-expanded={open} aria-controls="more-menu" onClick={() => setOpen((o) => !o)} className={MORE.some((m) => m.id === section) ? 'is-active' : ''}>
        More <Icon name="right" size={14} className={open ? 'rot90' : ''} />
      </button>
      <div id="more-menu" className={`more-menu${open ? ' is-open' : ''}`} hidden={!open}>
        <img src="/assets/sprites/sprig-2.webp" alt="" className="more-menu__sprig" />
        {MORE.map((m) => <a key={m.id} href={m.to} onClick={() => setOpen(false)} aria-current={section === m.id ? 'page' : undefined}>{m.label}</a>)}
      </div>
    </li>
  )
}

export default function FreshFindNavigation({ section, onSearch, onAuth, savedCount, basketCount = 0, onBasket }) {
  const [menu, setMenu] = useState(false)
  const current = section === 'home' ? null : section === 'explore' ? 'explore' : section
  useEffect(() => setMenu(false), [section])
  return (
    <>
      <header className={`topbar${section === 'home' ? ' topbar--home' : ''}`}>
        <a href="#/" className="brand-sign" aria-label="FreshFind home" data-cursor="open">
          <LeafMark size={26} />
          <span className="brand-sign__word">FreshFind</span>
          <span className="brand-sign__tag">Fresh All Along</span>
        </a>
        <nav className="rail" aria-label="Main">
          <ul>
            {LINKS.map((l) => (
              <li key={l.id}>
                <a href={l.to} aria-current={current === l.id ? 'page' : undefined} data-cursor="open">
                  {l.label}
                  {l.id === 'saved' && savedCount > 0 && <span className="rail__count" aria-label={`${savedCount} saved`}>{savedCount}</span>}
                </a>
              </li>
            ))}
            <MoreMenu section={section} onAuth={onAuth} />
          </ul>
        </nav>
        <div className="topbar__tools">
          <button type="button" className="icon-btn" onClick={onSearch} aria-label="Search markets and produce (press /)" data-cursor="open">
            <Icon name="search" />
          </button>
          <button type="button" className="icon-btn basket-nav" onClick={onBasket} aria-label={`Open Fresh Basket${basketCount ? `, ${basketCount} item${basketCount === 1 ? '' : 's'}` : ''}`} data-cursor="open">
            <Icon name="basket" />
            {basketCount > 0 && <span className="basket-nav__count">{basketCount > 99 ? '99+' : basketCount}</span>}
          </button>
          <Clock compact />
          <button type="button" className="btn btn--small btn--quiet topbar__login" onClick={() => onAuth('login')}>Log in</button>
          <button type="button" className="btn btn--small btn--primary topbar__signup" onClick={() => onAuth('signup')}>Sign up</button>
          <button type="button" className="icon-btn topbar__menu" aria-expanded={menu} aria-controls="mobile-drawer" onClick={() => setMenu((m) => !m)} aria-label="Menu">
            <Icon name={menu ? 'close' : 'menu'} />
          </button>
        </div>
      </header>

      {/* Mobile: drawer for "More", a bottom tab bar for the five main rooms */}
      <div id="mobile-drawer" className={`drawer${menu ? ' is-open' : ''}`} hidden={!menu}>
        <Clock />
        {MORE.map((m) => <a key={m.id} href={m.to}>{m.label}</a>)}
        <div className="drawer__auth">
          <button type="button" className="btn btn--quiet" onClick={() => onAuth('login')}>Log in</button>
          <button type="button" className="btn btn--primary" onClick={() => onAuth('signup')}>Sign up</button>
        </div>
      </div>
      <nav className="tabbar" aria-label="Main (mobile)">
        {LINKS.map((l) => (
          <a key={l.id} href={l.to} aria-current={current === l.id ? 'page' : undefined}>
            <Icon name={l.icon} size={20} />
            <span>{l.label}</span>
            {l.id === 'saved' && savedCount > 0 && <b className="tabbar__count">{savedCount}</b>}
          </a>
        ))}
      </nav>
    </>
  )
}
