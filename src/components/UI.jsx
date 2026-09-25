import { useEffect, useId, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import Vines from './Vines.jsx'
import { useApp } from '../lib/context.js'
import { marketStatus } from '../lib/schedule.js'
import { distanceKm, formatKm } from '../lib/geo.js'
import { canNativeShare, nativeShare, socialLinks, copyText } from '../lib/share.js'
import { absoluteUrl, go } from '../lib/router.js'

export function StatusPill({ market, long = false }) {
  const { now } = useApp()
  const st = marketStatus(market, now)
  return (
    <span className={`status ${st.open ? 'status--open' : 'status--closed'}${st.closingSoon ? ' status--soon' : ''}`}>
      <i aria-hidden="true" />
      {long ? st.label : st.open ? 'Open now' : st.short}
    </span>
  )
}

export function Distance({ market }) {
  const { geo } = useApp()
  if (!geo.coords) return null
  return <span className="distance"><Icon name="pin" size={14} />{formatKm(distanceKm(geo.coords, market))}</span>
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((it, i) => (
          <li key={it.label}>
            {i < items.length - 1 ? <a href={it.to}>{it.label}</a> : <span aria-current="page">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** A room of the greenhouse: a cream paper sheet over the world. */
export function Sheet({ title, kicker, crumbs, onClose, children, className = '', actions, closeLabel = 'Back to the market' }) {
  const headingId = useId()
  const headingRef = useRef(null)
  const bodyRef = useRef(null)
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    bodyRef.current?.scrollTo?.(0, 0)
  }, [title])
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      if (document.querySelector('.search.is-open, .auth[open], .chat.is-open, .share-pop')) return
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <section className={`sheet ${className}`} aria-labelledby={headingId}>
      <div className="sheet__scroll allow-scroll" ref={bodyRef}>
        <div className="sheet-vines" aria-hidden="true"><Vines variant="sheet" delay={100} /></div>
        <header className="sheet__head">
          <div className="sheet__head-row">
            {crumbs && <Breadcrumbs items={crumbs} />}
            <button type="button" className="icon-btn sheet__close" onClick={onClose} aria-label={closeLabel} data-cursor="open">
              <Icon name="close" />
            </button>
          </div>
          {kicker && <p className="sheet__kicker">{kicker}</p>}
          <h1 id={headingId} ref={headingRef} tabIndex={-1} className="sheet__title">{title}</h1>
          {actions && <div className="sheet__actions">{actions}</div>}
        </header>
        <div className="sheet__body">{children}</div>
      </div>
    </section>
  )
}

export function BookmarkButton({ type, id, name, compact = false }) {
  const { bookmarks, toast } = useApp()
  const saved = bookmarks.has(type, id)
  return (
    <button
      type="button"
      className={`save-btn${saved ? ' is-saved' : ''}${compact ? ' save-btn--compact' : ''}`}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
      data-cursor="save"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        bookmarks.toggle(type, id)
        toast(saved ? `Removed ${name} from Saved` : `Saved ${name}`, saved ? null : { label: 'View saved', to: '#/saved' })
      }}
    >
      <Icon name="heart" size={compact ? 18 : 20} />
      {!compact && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  )
}

export function ShareButton({ title, text, hash, label = 'Share' }) {
  const { toast } = useApp()
  const [open, setOpen] = useState(false)
  const popRef = useRef(null)
  const url = absoluteUrl(hash)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!popRef.current?.parentElement.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') { e.preventDefault(); setOpen(false) } }
    document.addEventListener('pointerdown', close)
    window.addEventListener('keydown', esc)
    popRef.current?.querySelector('a,button')?.focus()
    return () => { document.removeEventListener('pointerdown', close); window.removeEventListener('keydown', esc) }
  }, [open])
  const onClick = async () => {
    if (canNativeShare()) {
      const r = await nativeShare({ title, text, url })
      if (r !== 'failed') return
    }
    setOpen((o) => !o)
  }
  return (
    <span className="share">
      <button type="button" className="ghost-btn" onClick={onClick} aria-expanded={open} aria-haspopup="true" data-cursor="open">
        <Icon name="share" size={18} /> {label}
      </button>
      {open && (
        <span className="share-pop" ref={popRef} role="group" aria-label="Share options">
          {socialLinks({ title, text, url }).map((s) => (
            <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" className={`share-pop__${s.id}`}>{s.label}</a>
          ))}
          <button type="button" onClick={async () => { toast((await copyText(url)) ? 'Link copied' : 'Copy failed — select the address bar instead'); setOpen(false) }}>
            <Icon name="copy" size={16} /> Copy link
          </button>
        </span>
      )}
    </span>
  )
}

export function NoteField({ type, id, name }) {
  const { bookmarks } = useApp()
  const saved = bookmarks.has(type, id)
  const fieldId = useId()
  if (!saved) {
    return <p className="note-hint"><Icon name="heart" size={16} /> Save this to add a personal note.</p>
  }
  return (
    <div className="note">
      <label htmlFor={fieldId}>Your note <small>kept for this session only</small></label>
      <textarea
        id={fieldId}
        rows={2}
        maxLength={400}
        placeholder={`e.g. ${type === 'market' ? 'meet Sam by the bakery stall' : 'buy 2 kg for jam'}`}
        value={bookmarks.getNote(type, id)}
        onChange={(e) => bookmarks.setNote(type, id, e.target.value)}
        aria-label={`Personal note for ${name}`}
      />
    </div>
  )
}

export function LinkButton({ to, children, variant = 'primary', icon = 'arrow', ...rest }) {
  return (
    <a href={to} className={`btn btn--${variant}`} {...rest} onClick={(e) => { if (rest.onClick) rest.onClick(e) }}>
      <span>{children}</span>{icon && <Icon name={icon} size={18} />}
    </a>
  )
}

export function Toasts({ items, dismiss }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="toast">
          <Icon name="leaf" size={16} />
          <span>{t.text}</span>
          {t.action && <button type="button" onClick={() => { go(t.action.to); dismiss(t.id) }}>{t.action.label}</button>}
        </div>
      ))}
    </div>
  )
}
