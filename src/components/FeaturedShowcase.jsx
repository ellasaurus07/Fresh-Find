import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

// SRS Home "Highlights": a rotating showcase of nearby / open-now markets and
// this week's seasonal picks, styled as a tag hanging on a string. Autoplay
// pauses on hover/focus, is off for reduced motion, and has manual controls.
export default function FeaturedShowcase({ items, reduced, className = '' }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [manual, setManual] = useState(false)
  const n = items.length
  const idx = n ? i % n : 0
  const timer = useRef(null)
  useEffect(() => {
    if (reduced || paused || n < 2) return
    timer.current = setInterval(() => setI((v) => v + 1), 5200)
    return () => clearInterval(timer.current)
  }, [reduced, paused, n])
  if (!n) return null
  const it = items[idx]
  const step = (d) => { setManual(true); setI((v) => (v + d + n) % n) }
  return (
    <section
      className={`showcase ${className}`}
      aria-roledescription="carousel"
      aria-label="Today at FreshFind"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="showcase__string" aria-hidden="true" />
      <div className="showcase__card" aria-live={manual ? 'polite' : 'off'}>
        <div className="showcase__slide" key={it.key} role="group" aria-roledescription="slide" aria-label={`${idx + 1} of ${n}`}>
          <span className={`showcase__label showcase__label--${it.tone}`}>{it.label}</span>
          <a href={it.href} className="showcase__link" data-cursor="view">
            <span className={`showcase__img showcase__img--${it.kind}`}><img src={it.img} alt="" loading="lazy" /></span>
            <strong>{it.title}</strong>
            <span>{it.sub}</span>
          </a>
        </div>
        <div className="showcase__nav">
          <button type="button" className="icon-btn icon-btn--sm" onClick={() => step(-1)} aria-label="Previous highlight"><Icon name="left" size={16} /></button>
          <span className="showcase__dots" aria-hidden="true">{items.map((x, k) => <i key={x.key} className={k === idx ? 'is-on' : ''} />)}</span>
          <button type="button" className="icon-btn icon-btn--sm" onClick={() => step(1)} aria-label="Next highlight"><Icon name="right" size={16} /></button>
        </div>
      </div>
    </section>
  )
}
