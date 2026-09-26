import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import useDragPhysics, { MAX_PITCH } from '../hooks/useDragPhysics.js'
import useWheelIntent from '../hooks/useWheelIntent.js'
import { quatFromYPR, quatMul, slerp, rotateVec, matrix3d, lerp, clamp, easeInOut, smooth } from '../lib/quat.js'
import MarketTile from './MarketTile.jsx'
import { tileMatchesTag } from '../lib/filters.js'

// ---------------------------------------------------------------------------
// THE MARKET WORLD
//
// One population of tiles (markets + produce), three poses, one morph value:
//
//   morph 0        MARKET GLOBE     tiles tangent to a sphere, drag to rotate
//   0 < morph < 1  UNFOLDING        each tile slerps from its sphere pose to its
//                                   wall pose, staggered front-to-back, swinging
//                                   outward like petals opening
//   morph 1        CURVED ARCHIVE   tiles on a concave wall around the viewer
//
// Poses are position (Vector3) + rotation (quaternion) + scale; every frame
// writes one CSS matrix3d per tile straight to the DOM (no React state per
// frame). Modes: 'globe' | 'morphing' | 'archive'. Only an explicit fold()
// (the RETURN TO GLOBE control) can take the archive back to the globe —
// wheel input in the archive only ever pans.
// ---------------------------------------------------------------------------

const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const STAGGER = 0.38
const TWEEN_S = 1.9
const AUTO_SPIN = 0.07 // rad/s when idle

function fib(i, n) {
  const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2
  const r = Math.sqrt(Math.max(0, 1 - y * y))
  const th = GOLDEN * i
  return [Math.cos(th) * r, y, Math.sin(th) * r]
}
const ROLL = [0, 0.06, -0.05, 0.03, -0.07, 0.04, -0.02, 0.07, -0.04, 0.05]
const wrap = (v, range) => {
  let r = (v + range / 2) % range
  if (r < 0) r += range
  return r - range / 2
}
const smoothstep = (a, b, x) => smooth(clamp((x - a) / (b - a), 0, 1))

// The globe card scale was originally tuned for a globe population around this
// size. As the full produce dataset grows the tile count, the scale factor
// below shrinks proportionally (by ~1/sqrt(count)) so the sphere's surface
// density — and therefore the visible gaps of dark green between cards —
// stays roughly constant instead of the cards piling up and overlapping.
// This only scales the GLOBE pose; the archive (unfolded) card size is
// computed independently from tileW/tileH and is never touched by this.
const GLOBE_SCALE_BASELINE_COUNT = 41
const GLOBE_SCALE_MIN = 0.62
const GLOBE_SCALE_MAX = 1.08
function globeCountScale(globeCount) {
  const ratio = Math.sqrt(GLOBE_SCALE_BASELINE_COUNT / Math.max(1, globeCount))
  return clamp(ratio, GLOBE_SCALE_MIN, GLOBE_SCALE_MAX)
}

function measure(count, globeCount = count) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const mobile = vw < 720
  const tileW = mobile ? Math.round(clamp(vw * 0.4, 128, 168)) : Math.round(clamp(Math.min(vw * 0.12, vh * 0.235), 140, 196))
  const tileH = Math.round(tileW * 1.22)

  // Keep the current globe sizing, but let the unfolded archive use the
  // fuller multi-row geometry from the earlier version.
  const top = mobile ? 64 + 74 : 76
  const bottomUi = mobile ? 64 + 130 : 130
  const avail = vh - top - bottomUi
  // Desktop composition: [left copy] · globe · [right card]. The two side columns share one
  // width and margin, and the globe (with its orbit tags) is sized to leave clear air on both
  // sides, so it always sits centred between them. Tablet-portrait / phone keep their own layout.
  const wide = vw > 900
  const sideM = clamp(Math.round(vw * 0.03), 16, 48)
  const sideW = vw >= 1180 ? 236 : 188
  const orbitRx = vw >= 1280 ? 1.28 : 1.16 // horizontal orbit radius, in globe radii
  const tagRoom = vw >= 1280 ? 78 : 62 // half a tag + a gap
  const fitR = (vw / 2 - sideM - sideW - tagRoom) / orbitRx
  const R = mobile ? Math.min(vw * 0.34, avail * 0.35)
    : wide ? Math.max(150, Math.min(vw * 0.205, avail * 0.43, fitR))
    : Math.min(vw * 0.26, avail * 0.46)

const cellW = tileW * 1.11
const cellH = tileH * 1.10
const cardsAcross = Math.max(
  1,
  Math.ceil(vw / cellW) + 1
)
const rows = mobile
  ? Math.min(
      3,
      Math.max(1, Math.floor(count / Math.max(3, cardsAcross)))
    )
  : Math.min(
      4,
      Math.max(1, Math.floor(count / cardsAcross))
    )

  return {
    vw, vh, mobile, tileW, tileH, R, cellW, cellH, rows, sideM, sideW, orbitRx,
    globeScale: ((R * 0.4) / tileW) * globeCountScale(globeCount),
    globeY: top + avail / 2 - vh / 2,
    archiveY: mobile ? vh * 0.08 : vh * 0.075,
    turn: vw * (mobile ? 0.9 : 0.62),
    posR: vw * (mobile ? 0.7 : 0.55),
    depth: vw * (mobile ? 0.25 : 0.42),
  }
}

const MarketWorld = forwardRef(function MarketWorld(
  { tiles, order, active, reducedMotion, entering, onOpen, onModeChange, onHover, cursor, hasLocation = false },
  ref
) {
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const tileEls = useRef(new Map())
  const previewRef = useRef(null)
  const modeRef = useRef('globe')
  const [mode, setModeState] = useState('globe')
  const [hovered, setHovered] = useState(null)
  const geo = useRef(null)
  const morph = useRef({ value: 0, tween: null })
  const hoverKey = useRef(null)
  const geoCoordsRef = useRef(false)
  geoCoordsRef.current = hasLocation
  const highlight = useRef(null) // orbit tag being hovered: lights its category on the globe
  const focusTarget = useRef(null) // { kind: 'rotate'|'pan', x, y }
  const assemble = useRef({ start: entering && !reducedMotion ? -1 : null })
  const activeRef = useRef(active)
  activeRef.current = active
  const reducedRef = useRef(reducedMotion)
  reducedRef.current = reducedMotion
  const onModeChangeRef = useRef(onModeChange)
  onModeChangeRef.current = onModeChange

  // per-tile animation state, keyed by tile key
  const anim = useRef(new Map())
  const tileIndex = useRef(new Map())

  const setMode = useCallback((m) => {
    if (modeRef.current === m) return
    modeRef.current = m
    setModeState(m)
    onModeChangeRef.current?.(m)
  }, [])

  const physics = useDragPhysics(rootRef, modeRef, () => activeRef.current && modeRef.current !== 'morphing')

  /* ------------------------------ morph control ----------------------------- */
  const tweenTo = useCallback((target) => {
    const m = morph.current
    if (reducedRef.current) {
      m.value = target
      m.tween = null
      setMode(target === 1 ? 'archive' : 'globe')
      return
    }
    m.tween = { from: m.value, to: target, t0: performance.now(), dur: TWEEN_S * Math.max(0.35, Math.abs(target - m.value)) }
    setMode('morphing')
  }, [setMode])

  const unfold = useCallback(() => {
    physics.stop()
    hoverKey.current = null
    setHovered(null)
    tweenTo(1)
  }, [physics, tweenTo])
  const fold = useCallback(() => {
    physics.stop()
    tweenTo(0)
  }, [physics, tweenTo])

  useWheelIntent(rootRef, {
    enabled: () => activeRef.current,
    getMode: () => modeRef.current,
    isTweening: () => !!morph.current.tween,
    applyMorph: (d) => {
      const m = morph.current
      if (m.tween) return
      m.value = clamp(m.value + d, 0, 1)
      if (m.value >= 1) setMode('archive')
      else if (m.value <= 0) setMode('globe')
      else setMode('morphing')
    },
    onSettle: () => {
      const m = morph.current
      if (m.tween || modeRef.current !== 'morphing') return
      tweenTo(m.value > 0.3 ? 1 : 0)
    },
    applyArchive: (x, y) => {
      focusTarget.current = null
      physics.nudge(x, y)
    },
  })

  /* ------------------------------ geometry ------------------------------ */
  const layoutKey = `${order.join('|')}::${tiles.length}`
  useLayoutEffect(() => {
    const recompute = () => {
      geo.current = measure(order.length || 1, tiles.length || 1)
      const g = geo.current
      document.documentElement.style.setProperty('--tile-w', `${g.tileW}px`)
      document.documentElement.style.setProperty('--tile-h', `${g.tileH}px`)
      document.documentElement.style.setProperty('--globe-r', `${g.R}px`)
      document.documentElement.style.setProperty('--globe-y', `${g.globeY}px`)
      document.documentElement.style.setProperty('--side-m', `${g.sideM}px`)
      document.documentElement.style.setProperty('--side-w', `${g.sideW}px`)
      document.documentElement.style.setProperty('--orbit-rx', String(g.orbitRx))
    }
    recompute()
    window.addEventListener('resize', recompute)
    return () => window.removeEventListener('resize', recompute)
  }, [layoutKey])

  // sphere directions are fixed per tile (index in the full list), archive slots follow `order`
  useLayoutEffect(() => {
    tiles.forEach((t, i) => {
      if (!anim.current.has(t.key)) {
        anim.current.set(t.key, { hx: null, hy: null, vis: 1, hover: 0, dim: 0, lit: 0, op: -1, tf: '' })
      }
      tileIndex.current.set(t.key, i)
    })
  }, [tiles])

  /* ------------------------------ the frame loop ------------------------------ */
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const qG = [0, 0, 0, 1], qA = [0, 0, 0, 1], qL = [0, 0, 0, 1], qT = [0, 0, 0, 1], qX = [0, 0, 0, 1], qY = [0, 0, 0, 1]
    const pG = [0, 0, 0], pA = [0, 0, 0], n = [0, 0, 0], tmp = [0, 0, 0]
    let lastReveal = -1
    let lastUnfold = -1
    const orderSet = new Set(order)

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const g = geo.current
      if (!g || !stageRef.current) return
      const m = morph.current
      const mode = modeRef.current
      const idleOk = activeRef.current && !document.hidden

      /* morph tween */
      if (m.tween) {
        const k = clamp((now - m.tween.t0) / (m.tween.dur * 1000), 0, 1)
        m.value = lerp(m.tween.from, m.tween.to, easeInOut(k))
        if (k >= 1) {
          m.value = m.tween.to
          m.tween = null
          setMode(m.value >= 1 ? 'archive' : 'globe')
          if (m.value >= 1) {
            physics.pan.current.x = 0
            physics.pan.current.y = 0
          }
        }
      }

      /* physics + auto spin + focus springs */
      if (idleOk) {
        physics.update(dt)
        const rot = physics.rotation.current
        if (mode === 'globe' && !physics.isDragging.current && !hoverKey.current && !reducedRef.current && !focusTarget.current &&
          Math.abs(physics.velocity.current.y) < 0.02) {
          rot.y += AUTO_SPIN * dt
        }
        const f = focusTarget.current
        if (f && !physics.isDragging.current) {
          const k = 1 - Math.exp(-7 * dt)
          if (f.kind === 'rotate') {
            // shortest way round
            const dy = Math.atan2(Math.sin(f.y - rot.y), Math.cos(f.y - rot.y))
            rot.y += dy * k
            rot.x += (f.x - rot.x) * k
            if (Math.abs(dy) < 0.002 && Math.abs(f.x - rot.x) < 0.002) focusTarget.current = null
          } else {
            const p = physics.pan.current
            p.x += (f.x - p.x) * k
            p.y += (f.y - p.y) * k
            if (Math.abs(f.x - p.x) < 0.5 && Math.abs(f.y - p.y) < 0.5) focusTarget.current = null
          }
        }
      }

      /* environment reacts to the unfold (camera pulls back into the greenhouse) */
      if (Math.abs(m.value - lastUnfold) > 0.001 || ((m.value === 0 || m.value === 1) && m.value !== lastUnfold)) {
        lastUnfold = m.value
        document.documentElement.style.setProperty('--unfold', m.value.toFixed(4))
      }
      const reveal = smoothstep(0.62, 1, m.value)
      if (Math.abs(reveal - lastReveal) > 0.002 || ((reveal === 0 || reveal === 1) && reveal !== lastReveal)) {
        lastReveal = reveal
        rootRef.current.style.setProperty('--reveal', reveal.toFixed(3))
      }

      /* assemble-in (arriving from the intro) */
      const as = assemble.current
      if (as.start === -1) as.start = now
      const assembling = as.start != null
      const aT = assembling ? clamp((now - as.start) / 1700, 0, 1) : 1
      if (assembling && aT >= 1) as.start = null

      /* globe rotation quaternion: pitch about screen X after yaw about Y */
      const rot = physics.rotation.current
      quatFromYPR(0, rot.x, 0, qX)
      quatFromYPR(rot.y, 0, 0, qY)
      quatMul(qX, qY, qG)

      /* archive field */
      const count = Math.max(1, order.length)
      const rows = g.rows
      const cols = Math.max(1, Math.ceil(count / rows))
      const fieldW = cols * g.cellW
      const fieldH = rows * g.cellH
      const wrapX = fieldW > g.vw * 0.95
      const wrapY = fieldH > g.vh * 0.72
      const pan = physics.pan.current
      if (!wrapX) {
        pan.x = 0
        physics.velocity.current.x = 0
      }

      if (!wrapY) {
        pan.y = 0
        physics.velocity.current.y = 0
      }

      const hk = hoverKey.current
      const n1 = tiles.length
      const inOrder = orderSet
      for (let slot = 0; slot < order.length + n1; slot += 1) {
        // visible tiles first (in archive order), then the hidden remainder
        const key = slot < order.length ? order[slot] : tiles[slot - order.length]?.key
        if (!key) continue
        if (slot >= order.length && inOrder.has(key)) continue
        const el = tileEls.current.get(key)
        const a = anim.current.get(key)
        if (!el || !a) continue
        const idx = tileIndex.current.get(key) ?? 0
        const visible = slot < order.length

        const row = visible ? slot % rows : 0
        const col = visible ? Math.floor(slot / rows) : 0

        const rowCount = visible
          ? Math.ceil((count - row) / rows)
          : 1

        const rowWidth = Math.max(
          g.cellW,
          rowCount * g.cellW
        )

        const tx = visible
          ? (col - (rowCount - 1) / 2) * g.cellW +
            (row % 2 ? g.cellW * 0.08 : 0)
          : 0

        const ty = visible
          ? (row - (rows - 1) / 2) * g.cellH +
            (col % 2 ? g.cellH * 0.035 : 0)
          : 0
        if (a.hx == null) { a.hx = tx; a.hy = ty }
        if (visible) {
          const k = 1 - Math.exp(-6 * dt)
          a.hx += (tx - a.hx) * k
          a.hy += (ty - a.hy) * k
        }
        a.vis += ((visible ? 1 : 0) - a.vis) * (1 - Math.exp(-8 * dt))
        a.hover += ((hk === key ? 1 : 0) - a.hover) * (1 - Math.exp(-12 * dt))
        const hl = highlight.current
        const isMatch = hl ? tileMatchesTag(tiles[idx], hl, !!geoCoordsRef.current) : false
        a.dim += (((hl && !isMatch) ? 1 : 0) - a.dim) * (1 - Math.exp(-9 * dt))
        a.lit += (((hl && isMatch && hl !== 'all') ? 1 : 0) - a.lit) * (1 - Math.exp(-9 * dt))

        /* ---- globe pose ---- */
        const d = fib(idx, n1)
        const lon = Math.atan2(d[0], d[2])
        const lat = -Math.asin(d[1])
        quatFromYPR(lon, lat, ROLL[idx % ROLL.length], qL)
        quatMul(qG, qL, qT)
        rotateVec(qG, d, n) // outward normal (unit)
        const R = g.R
        pG[0] = n[0] * R
        pG[1] = n[1] * R + g.globeY
        pG[2] = n[2] * R
        let sG = g.globeScale * (1 + 0.07 * a.lit)
        if (a.hover > 0.001) {
          pG[0] += n[0] * 46 * a.hover
          pG[1] += n[1] * 46 * a.hover
          pG[2] += n[2] * 46 * a.hover
          sG *= 1 + 0.2 * a.hover
        }
        const front = clamp((n[2] + 0.25) / 1.0, 0, 1)
        let opG = (0.10 + 0.90 * front) * (1 - 0.68 * a.dim)
        if (hk && hk !== key) opG *= 0.62

        /* ---- archive pose ---- */
        const rowWrapX = rowWidth > g.vw * 0.95
        const sx = rowWrapX
          ? wrap(a.hx + pan.x, rowWidth)
          : a.hx + pan.x
        const sy = wrapY ? wrap(a.hy + pan.y, fieldH) : a.hy + pan.y
        const yaw = -clamp(sx / g.turn, -1.15, 1.15)
        const pitch = clamp(sy / (g.vh * 3.2), -0.14, 0.14)
        quatFromYPR(yaw, -pitch, 0, qA)
        pA[0] = sx * 0.95
        pA[1] = sy + g.archiveY
        pA[2] = -g.depth * (1 - Math.cos(clamp(sx / g.posR, -1.3, 1.3))) - Math.abs(sy) * 0.08 - (g.mobile ? 60 : 150) + a.hover * 34
        let edge = 1
        if (rowWrapX) {
          edge *= 1 - smoothstep(
            rowWidth / 2 - g.cellW * 0.9,
            rowWidth / 2 - g.cellW * 0.1,
            Math.abs(sx)
          )
        }
        if (wrapY) edge *= 1 - smoothstep(fieldH / 2 - g.cellH * 0.9, fieldH / 2 - g.cellH * 0.12, Math.abs(sy))
        const sA = 1 + a.hover * 0.04

        /* ---- blend: staggered, front-first, swinging outward ---- */
        const delay = (1 - clamp((n[2] + 1) / 2, 0, 1)) * STAGGER
        const t = easeInOut(clamp((m.value - delay) / (1 - STAGGER), 0, 1))
        const swing = Math.sin(Math.PI * t)
        const px = lerp(pG[0], pA[0], t) + n[0] * R * 0.7 * swing
        const py = lerp(pG[1], pA[1], t) + n[1] * R * 0.45 * swing
        const pz = lerp(pG[2], pA[2], t) + R * 0.55 * swing
        slerp(qT, qA, t, qL)
        let s = lerp(sG, sA, t)
        let op = lerp(opG, edge, t) * a.vis // filtered-out tiles fade where they stand

        /* ---- assemble from a scatter, arriving from the intro ---- */
        tmp[0] = px; tmp[1] = py; tmp[2] = pz
        if (assembling) {
          const local = easeInOut(clamp((aT - (idx % 9) * 0.035) / 0.7, 0, 1))
          tmp[0] = lerp(d[0] * R * 3.2, px, local)
          tmp[1] = lerp(d[1] * R * 2.6 + g.globeY, py, local)
          tmp[2] = lerp(700 + d[2] * 300, pz, local)
          op *= local
          s *= lerp(0.6, 1, local)
        }

        const tf = matrix3d(tmp, qL, s)
        if (tf !== a.tf) {
          a.tf = tf
          el.style.transform = tf
        }
        const o = Math.round(op * 100) / 100
        if (o !== a.op) {
          a.op = o
          el.style.opacity = String(o)
          const off = o < 0.12
          if (off !== a.off) {
            a.off = off
            el.style.visibility = off ? 'hidden' : 'visible'
          }
        }
      }

      /* hover preview follows its tile */
      if (hk && previewRef.current && modeRef.current === 'globe') {
        const el = tileEls.current.get(hk)
        if (el) {
          const r = el.getBoundingClientRect()
          const pv = previewRef.current
          const right = r.right + 300 < g.vw
          pv.style.transform = `translate3d(${Math.round(right ? r.right + 14 : r.left - 14 - pv.offsetWidth)}px, ${Math.round(r.top + r.height / 2 - pv.offsetHeight / 2)}px, 0)`
        }
      }
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // order/tiles are read fresh through the closure each time they change
  }, [order, tiles, physics, setMode])

  /* ------------------------------ interaction ------------------------------ */
  const setHover = useCallback((key) => {
    hoverKey.current = key
    setHovered(key)
    onHover?.(key)
  }, [onHover])

  const handleFocusTile = useCallback((key) => {
    setHover(key)
    const g = geo.current
    const idx = tileIndex.current.get(key)
    if (idx == null || !g) return
    if (modeRef.current === 'globe') {
      const d = fib(idx, tiles.length)
      const y = -Math.atan2(d[0], d[2])
      const h = Math.hypot(d[0], d[2])
      const x = clamp(Math.atan2(d[1], h), -MAX_PITCH, MAX_PITCH)
      focusTarget.current = { kind: 'rotate', x, y }
      physics.stop()
    } else if (modeRef.current === 'archive') {
      const a = anim.current.get(key)
      if (!a) return
      // bring the tile to the centre, the short way round a wrapped field
      const count = Math.max(1, order.length)
      const cols = Math.max(1, Math.ceil(count / g.rows))
      const fieldW = cols * g.cellW
      const fieldH = g.rows * g.cellH
      const p = physics.pan.current
      const wantX = p.x - wrap(a.hx + p.x, fieldW)
      const wantY = fieldH > g.vh * 0.72 ? p.y - wrap(a.hy + p.y, fieldH) : 0
      focusTarget.current = { kind: 'pan', x: fieldW > g.vw * 0.95 ? wantX : 0, y: wantY }
      physics.stop()
    }
  }, [physics, tiles.length, order.length, setHover])

  const handleClick = useCallback((e, tile) => {
    e.preventDefault()
    if (physics.wasDrag.current) return
    if (modeRef.current === 'morphing') return
    const el = tileEls.current.get(tile.key)
    const img = el?.querySelector('img')
    onOpen?.(tile, img ? img.getBoundingClientRect() : el?.getBoundingClientRect(), img?.currentSrc || tile.img)
  }, [physics, onOpen])

  const onKeyDown = useCallback((e) => {
    if (!activeRef.current) return
    if (e.target.closest('input, select, textarea')) return
    const g = geo.current
    const mode = modeRef.current
    const k = e.key
    if (mode === 'archive' && g) {
      const map = { ArrowLeft: [g.cellW, 0], ArrowRight: [-g.cellW, 0], ArrowUp: [0, g.cellH], ArrowDown: [0, -g.cellH], PageUp: [0, g.cellH * 2], PageDown: [0, -g.cellH * 2] }
      if (map[k]) { e.preventDefault(); focusTarget.current = null; physics.nudge(map[k][0], map[k][1]) }
    } else if (mode === 'globe') {
      const r = physics.rotation.current
      if (k === 'ArrowLeft') { e.preventDefault(); r.y -= 0.25 }
      if (k === 'ArrowRight') { e.preventDefault(); r.y += 0.25 }
      if (k === 'ArrowUp') { e.preventDefault(); r.x = clamp(r.x + 0.2, -MAX_PITCH, MAX_PITCH) }
      if (k === 'ArrowDown') { e.preventDefault(); r.x = clamp(r.x - 0.2, -MAX_PITCH, MAX_PITCH) }
      if (k === 'PageDown') { e.preventDefault(); unfold() }
    }
  }, [physics, unfold])

  useEffect(() => {
  const handleWindowKey = (e) => {
    if (!activeRef.current) return
    if (
      e.target.closest?.(
        'input, textarea, select, [contenteditable="true"]'
      )
    ) {
      return
    }
    onKeyDown(e)
  }
  window.addEventListener('keydown', handleWindowKey)
  return () => {
    window.removeEventListener('keydown', handleWindowKey)
  }
}, [onKeyDown])

  // Called when the visitor leaves the Market World via the FreshFind logo / Home,
  // rather than the "Return to globe" control. Snaps everything back to the
  // default CLOSED GLOBE state with no tween (the world is invisible behind the
  // Home scene at this point, so there is nothing to see glitch), so the next
  // "Enter the Market" always opens on the globe, not a stale unfolded archive.
  const resetClosed = useCallback(() => {
    physics.stop()
    physics.pan.current.x = 0
    physics.pan.current.y = 0
    focusTarget.current = null
    hoverKey.current = null
    setHovered(null)
    highlight.current = null
    const m = morph.current
    m.tween = null
    m.value = 0
    setMode('globe')
  }, [physics, setMode])

  useImperativeHandle(ref, () => ({
    unfold,
    fold,
    resetClosed,
    getMode: () => modeRef.current,
    setHighlight: (id) => { highlight.current = id },
    getTileRect: (key) => {
      const el = tileEls.current.get(key)
      const img = el?.querySelector('img')
      return (img || el)?.getBoundingClientRect() || null
    },
    hideTile: (key, hidden) => {
      const el = tileEls.current.get(key)
      if (el) el.classList.toggle('is-flying', hidden)
    },
  }), [unfold, fold, resetClosed])

  const hoveredTile = hovered ? tiles.find((t) => t.key === hovered) : null
  const orderSet = new Set(order)

  return (
    <div
      ref={rootRef}
      className={`world world--${mode}${hovered ? ' has-hover' : ''}`}
      data-cursor={mode === 'archive' ? 'drag' : 'rotate'}
      aria-roledescription={mode === 'archive' ? 'curved market archive' : 'market globe'}
    >
      <div className="world__globe-core" aria-hidden="true">
        <span className="world__core-glow" />
      </div>
      <div className="world__viewport">
        <div
          ref={stageRef}
          className="world__stage"
          role="list"
          aria-label={mode === 'archive' ? `${order.length} markets and produce in the archive` : 'Market globe: markets and produce'}
        >
          {[...order.map((k) => tiles.find((t) => t.key === k)).filter(Boolean), ...tiles.filter((t) => !orderSet.has(t.key))].map((t) => (
            <MarketTile
              key={t.key}
              tile={t}
              hidden={!orderSet.has(t.key)}
              hovered={hovered === t.key}
              ref={(el) => { if (el) tileEls.current.set(t.key, el); else tileEls.current.delete(t.key) }}
              onClick={handleClick}
              onEnter={() => modeRef.current !== 'morphing' && setHover(t.key)}
              onLeave={() => hoverKey.current === t.key && setHover(null)}
              onFocus={(e) => {
                setHover(t.key)
                if (e.currentTarget.matches(':focus-visible')) {
                  handleFocusTile(t.key)
                }
              }}
              onBlur={() => hoverKey.current === t.key && setHover(null)}
              cursor={cursor}
            />
          ))}
        </div>
      </div>

      <div ref={previewRef} className={`globe-preview${hoveredTile && mode === 'globe' ? ' is-on' : ''}`} aria-hidden="true">
        {hoveredTile && (
          <>
            <span className={`globe-preview__status${hoveredTile.open ? ' is-open' : ''}`}>{hoveredTile.previewTag}</span>
            <strong>{hoveredTile.title}</strong>
            {hoveredTile.previewLines.map((l) => <span key={l}>{l}</span>)}
            <em>{hoveredTile.kind === 'market' ? 'View market →' : 'View guide →'}</em>
          </>
        )}
      </div>
    </div>
  )
})

export default MarketWorld
