import { useId, useMemo } from 'react'

// ---------------------------------------------------------------------------
// BOTANICAL VINES
//
// Drawn in SVG (no bitmap, so there is never a rectangular edge to see): a few
// hand-shaped stems, ivy / pothos leaves placed along them, and tiny tendrils.
// On entrance the stems grow along their curve and the leaves unfurl in order
// (≈ 1 s); afterwards only a very slight idle sway remains. Everything is
// decorative: aria-hidden, pointer-events: none, and static under
// prefers-reduced-motion.
//
// Variants
//   sheet  – top-right corner of a content sheet (hugs the top + right edges)
//   auth   – the same idea, shorter, for the Welcome back / Join dialogs
//   sprig  – a small curved sprig (hero-box corners, tagline flanks)
// ---------------------------------------------------------------------------

const IVY = 'M0 0C3 1.5 9 0 11.5-5.5C10-7 8-8 6-9.5C9-11 12-13.5 13-17.5C10.5-17.5 8-17.5 5.5-18.5C4.5-22 2.5-25.5 0-28.5C-2.5-25.5-4.5-22-5.5-18.5C-8-17.5-10.5-17.5-13-17.5C-12-13.5-9-11-6-9.5C-8-8-10-7-11.5-5.5C-9 0-3 1.5 0 0Z'
const POTHOS = 'M0 0C-9-1-14-10-8-18C-5-22-2-25 0-29C2-25 5-22 8-18C14-10 9-1 0 0Z'
const IVY_VEINS = 'M0-1V-24M0-8L-7-13M0-8L7-13M0-15L-4.5-19.5M0-15L4.5-19.5'
const POTHOS_VEINS = 'M0-1V-26M0-8L-6-13M0-8L6-13M0-15L-5-19M0-15L5-19'

/* ------------------------------------------------------------- geometry */
// a stem is a chain of cubic segments: [x0,y0, c1x,c1y, c2x,c2y, x,y, ...next segments as 6 numbers]
function sampleStem(pts, perSeg = 24) {
  const out = []
  let [x0, y0] = pts
  for (let i = 2; i < pts.length; i += 6) {
    const [c1x, c1y, c2x, c2y, x1, y1] = pts.slice(i, i + 6)
    for (let k = i === 2 ? 0 : 1; k <= perSeg; k += 1) {
      const t = k / perSeg, u = 1 - t
      out.push([
        u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x1,
        u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y1,
      ])
    }
    x0 = x1; y0 = y1
  }
  let len = 0
  return out.map((p, i) => {
    if (i) len += Math.hypot(p[0] - out[i - 1][0], p[1] - out[i - 1][1])
    return { x: p[0], y: p[1], len }
  })
}
const pathD = (pts) => {
  let d = `M${pts[0]} ${pts[1]}`
  for (let i = 2; i < pts.length; i += 6) d += `C${pts.slice(i, i + 6).join(' ')}`
  return d
}
function at(samples, len) {
  const total = samples[samples.length - 1].len
  const L = Math.min(Math.max(len, 0), total)
  let i = 1
  while (i < samples.length - 1 && samples[i].len < L) i += 1
  const a = samples[i - 1], b = samples[i]
  const t = b.len === a.len ? 0 : (L - a.len) / (b.len - a.len)
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, ang: Math.atan2(b.y - a.y, b.x - a.x) }
}

// leaf appearance cycles through a few sizes / shapes / greens so nothing looks stamped
const SIZES = [0.86, 1.0, 0.72, 0.94, 0.8, 1.06, 0.76]
const KINDS = ['ivy-a', 'ivy-b', 'pothos', 'ivy-a', 'ivy-c', 'pothos', 'ivy-b']
const SPREAD = [58, 66, 52, 72, 60, 64, 54]

function makeSpec(name) {
  if (name === 'sheet') {
    return {
      w: 340, h: 250, dur: 850,
      stems: [
        { pts: [352, -4, 308, 17, 268, -3, 226, 13, 186, 28, 152, 27, 118, 11, 96, 0, 66, 7, 48, 20], step: 23, start: 10, tail: 18 },
        { pts: [350, -4, 322, 34, 352, 58, 328, 90, 306, 122, 340, 146, 322, 176, 312, 198, 320, 214, 314, 232], step: 23, start: 12, tail: 16 },
        { pts: [226, 13, 212, 40, 238, 60, 216, 88, 204, 108, 212, 124, 224, 126], step: 22, start: 8, tail: 6, small: true },
        { pts: [328, 90, 300, 96, 284, 116, 292, 138], step: 22, start: 6, tail: 6, small: true },
      ],
      curls: ['M48 20c-9 4-11 15-4 19c6 3 12-3 9-8', 'M314 232c-4 8 2 15 9 12c5-2 5-9 1-10'],
    }
  }
  if (name === 'auth') {
    return {
      w: 300, h: 100, dur: 820,
      stems: [
        { pts: [308, -3, 268, 14, 236, -1, 198, 12, 164, 24, 132, 22, 104, 8, 88, 0, 62, 6, 50, 16], step: 22, start: 10, tail: 14 },
        { pts: [306, -3, 280, 22, 304, 40, 286, 60, 270, 74, 286, 84, 278, 92], step: 22, start: 12, tail: 10 },
        { pts: [198, 12, 186, 34, 208, 50, 190, 70], step: 21, start: 6, tail: 5, small: true },
      ],
      curls: ['M50 16c-8 3-10 13-4 17c6 3 11-3 8-7'],
    }
  }
  // sprig: a small arc with leaves on both sides, used at the hero corners and beside the tagline
  return {
    w: 96, h: 64, dur: 800,
    stems: [
      { pts: [4, 60, 20, 44, 34, 34, 52, 26, 66, 20, 78, 12, 90, 4], step: 15, start: 10, tail: 6, small: true },
    ],
    curls: [],
  }
}

function build(name) {
  const spec = makeSpec(name)
  let n = 0
  const stems = spec.stems.map((s, si) => {
    const samples = sampleStem(s.pts)
    const total = samples[samples.length - 1].len
    const leaves = []
    let side = si % 2 ? 1 : -1
    for (let L = s.start; L <= total - s.tail; L += s.step) {
      const p = at(samples, L)
      const k = n % SIZES.length
      const size = SIZES[k] * (s.small ? 0.82 : 1) * (0.9 + 0.1 * Math.min(1, L / 60)) // slightly smaller where a vine begins
      const phi = p.ang + (side * SPREAD[k] * Math.PI) / 180
      const rot = (phi * 180) / Math.PI + 90
      leaves.push({
        x: p.x, y: p.y, rot, size, kind: KINDS[k], frac: L / total, i: n,
        // tiny second leaf on the opposite side every third node → fuller, less regular
        pair: k % 3 === 1 ? { rot: ((p.ang - (side * (SPREAD[(k + 2) % 7] + 8) * Math.PI) / 180) * 180) / Math.PI + 90, size: size * 0.66, kind: KINDS[(k + 3) % 7] } : null,
      })
      side *= -1
      n += 1
    }
    return { d: pathD(s.pts), leaves, total }
  })
  return { ...spec, stems }
}

const cache = {}
const getSpec = (name) => (cache[name] ||= build(name))

/* ------------------------------------------------------------- component */
export default function Vines({ variant = 'sheet', className = '', delay = 120, mirror = false }) {
  const uid = useId().replace(/:/g, '')
  const spec = useMemo(() => getSpec(variant), [variant])
  const dur = spec.dur
  const g = (n) => `url(#${uid}-${n})`
  return (
    <div className={`vines vines--${variant} ${className}`} aria-hidden="true" style={{ '--vd': `${delay}ms`, '--vdur': `${dur}ms` }}>
      <svg className="vines__svg" viewBox={`0 0 ${spec.w} ${spec.h}`} preserveAspectRatio={mirror ? 'xMinYMin meet' : 'xMaxYMin meet'} focusable="false">
        <defs>
          <linearGradient id={`${uid}-a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d5e56f" /><stop offset="1" stopColor="#7ea63d" /></linearGradient>
          <linearGradient id={`${uid}-b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9d456" /><stop offset="1" stopColor="#5f8f33" /></linearGradient>
          <linearGradient id={`${uid}-c`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9cc24a" /><stop offset="1" stopColor="#4c7a2d" /></linearGradient>
          <g id={`${uid}-ivy-a`}><path d="M0 0V4" className="vstalk" /><path d={IVY} fill={g('a')} className="vleaf-line" /><path d={IVY_VEINS} className="vleaf-vein" /></g>
          <g id={`${uid}-ivy-b`}><path d="M0 0V4" className="vstalk" /><path d={IVY} fill={g('b')} className="vleaf-line" /><path d={IVY_VEINS} className="vleaf-vein" /></g>
          <g id={`${uid}-ivy-c`}><path d="M0 0V4" className="vstalk" /><path d={IVY} fill={g('c')} className="vleaf-line" /><path d={IVY_VEINS} className="vleaf-vein" /></g>
          <g id={`${uid}-pothos`}>
            <path d="M0 0V4" className="vstalk" />
            <path d={POTHOS} fill={g('b')} className="vleaf-line" />
            <path d="M0-2C-4-3-7-9-4-15C-2-18-1-20 0-23C1-20 2-18 4-15C7-9 4-3 0-2Z" fill="#dfe98a" opacity=".55" />
            <path d={POTHOS_VEINS} className="vleaf-vein" />
          </g>
        </defs>
        <g className="vines__sweep" style={mirror ? { transformOrigin: '0% 0%' } : undefined}>
          {spec.stems.map((s, si) => (
            <g key={si}>
              <path d={s.d} pathLength="1" className="vstem" style={{ animationDelay: `calc(var(--vd) + ${si * 60}ms)` }} />
              {s.leaves.map((l) => {
                const d = `calc(var(--vd) + ${Math.round(60 + l.frac * dur * 0.5 + si * 60)}ms)`
                return (
                  <g key={l.i}>
                    <g transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.rot.toFixed(1)}) scale(${l.size.toFixed(2)})`}>
                      <g className="vleaf" style={{ animationDelay: d }}>
                        <g className="vsway" style={{ animationDelay: `calc(${d} + ${(l.i % 5) * 0.7}s)` }}><use href={`#${uid}-${l.kind}`} /></g>
                      </g>
                    </g>
                    {l.pair && (
                      <g transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.pair.rot.toFixed(1)}) scale(${l.pair.size.toFixed(2)})`}>
                        <g className="vleaf" style={{ animationDelay: `calc(${d} + 90ms)` }}><use href={`#${uid}-${l.pair.kind}`} /></g>
                      </g>
                    )}
                  </g>
                )
              })}
            </g>
          ))}
          {spec.curls.map((d, i) => (
            <path key={i} d={d} pathLength="1" className="vstem vstem--curl" style={{ animationDelay: `calc(var(--vd) + ${Math.round(dur * 0.6)}ms)` }} />
          ))}
        </g>
      </svg>
    </div>
  )
}
