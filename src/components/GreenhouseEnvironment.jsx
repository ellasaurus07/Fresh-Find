import { useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// THE GREENHOUSE — a layered, living backdrop shared by every view.
//   sky → painted plates (market arch / greenhouse) → sunlight shafts →
//   pollen → swaying foreground foliage → warm vignette.
// Foreground foliage stays anchored to the scene; only hanging plants use
// a very gentle self-running sway. During the globe unfold the greenhouse
// plate pulls back and sharpens (driven by --unfold,
// written by the world) so the architecture "reveals itself" around you.
// ---------------------------------------------------------------------------
const S = (n) => `/assets/sprites/${n}.webp`
const FOREGROUND = {
  intro: [
    { src: 'hang-fern', cls: 'fg--hang fg--tl', depth: 0, delay: -2 },
    { src: 'hang-pothos', cls: 'fg--hang fg--tr', depth: 0, delay: -7 },
  ],
  world: [
    { src: 'hang-ivy', cls: 'fg--hang fg--tl', depth: 0, delay: -3 },
    { src: 'hang-pearls', cls: 'fg--hang fg--tr', depth: 0, delay: -8 },
  ],
}

function Pollen({ reduced }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reduced) return
    const c = ref.current
    const ctx = c.getContext('2d')
    let raf = 0
    let w = 0, h = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const resize = () => {
      w = c.clientWidth; h = c.clientHeight
      c.width = w * dpr; c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const count = window.innerWidth < 720 ? 14 : 28
    const motes = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * w, y: Math.random() * h, r: 0.8 + Math.random() * 2.2,
      vx: 4 + Math.random() * 10, vy: -3 + Math.random() * 6, ph: Math.random() * 6.28, a: 0.25 + Math.random() * 0.5, warm: i % 3 === 0,
    }))
    let last = performance.now()
    const tick = (t) => {
      raf = requestAnimationFrame(tick)
      if (document.hidden) return
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      ctx.clearRect(0, 0, w, h)
      for (const m of motes) {
        m.ph += dt * 0.8
        m.x += (m.vx + Math.sin(m.ph) * 6) * dt
        m.y += (m.vy + Math.cos(m.ph * 0.7) * 5) * dt
        if (m.x > w + 10) m.x = -10
        if (m.y > h + 10) m.y = -10
        if (m.y < -10) m.y = h + 10
        ctx.globalAlpha = m.a * (0.6 + 0.4 * Math.sin(m.ph * 1.3))
        ctx.fillStyle = m.warm ? '#fff3c4' : '#ffffff'
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r, 0, 6.283)
        ctx.fill()
      }
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [reduced])
  return <canvas ref={ref} className="env__pollen" />
}

// The market plate (and everything painted onto it, e.g. the FreshFind sign)
// waits for its image before appearing, so nothing pops in over a blank sky.
function markReady() { document.documentElement.classList.add('env-ready') }

export default function GreenhouseEnvironment({ scene, dim, reduced }) {
  useEffect(() => {
    const t = setTimeout(markReady, 2500) // never hold the page hostage to a slow image
    return () => clearTimeout(t)
  }, [])

  // Keep the painted environment and low foliage stable; CSS handles the gentle hanging-plant sway.

  return (
    <div className={`env env--${scene}${dim ? ' env--dim' : ''}`} aria-hidden="true">
      <div className="env__sky" />
      <div className="env__plate env__plate--market">
        <img src="/assets/env/market-arch-1672.webp" srcSet="/assets/env/market-arch-960.webp 960w, /assets/env/market-arch-1672.webp 1672w" sizes="(max-width: 900px) 960px, 1672px" alt="" decoding="async"
          ref={(el) => { if (el?.complete && el.naturalWidth) markReady() }} onLoad={markReady} onError={markReady} />
      </div>
      <div className="env__plate env__plate--greenhouse">
        <img src="/assets/env/greenhouse-1672.webp" srcSet="/assets/env/greenhouse-960.webp 960w, /assets/env/greenhouse-1672.webp 1672w" sizes="(max-width: 900px) 960px, 1672px" alt="" decoding="async" loading={scene === 'intro' ? 'lazy' : 'eager'} />
      </div>
      <div className="env__light"><i /><i /><i /></div>
      <Pollen reduced={reduced} />
      {Object.entries(FOREGROUND).map(([set, items]) => (
        <div key={set} className={`env__fg env__fg--${set}`}>
          {items.map((f) => (
            <img
              key={f.src}
              src={S(f.src)}
              alt=""
              className={`fg ${f.cls}${f.sway ? ' fg--sway' : ''}`}
              style={{ '--depth': f.depth, animationDelay: f.delay ? `${f.delay}s` : undefined }}
              decoding="async"
              loading={set === scene ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      ))}
      <div className="env__vignette" />
    </div>
  )
}
