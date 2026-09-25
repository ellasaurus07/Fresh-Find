import { useEffect, useMemo, useRef } from 'react'

// ---------------------------------------------------------------------------
// DRAG PHYSICS (ported). Globe: drag = rotate with angular mass and a long
// coast. Archive: drag = grab the wall and throw it, 1:1 with the pointer.
// Velocity is per second and damped exponentially, so the feel is identical
// at 60, 90 or 120 Hz. Movement is tracked on window so clicks on tiles still
// reach the tile (no pointer capture).
// ---------------------------------------------------------------------------
const ROTATE_PER_PX = 0.0058
const ROTATE_FRICTION = 2.3
const PAN_FRICTION = 3.2
export const MAX_PITCH = 0.62
const VELOCITY_FLOOR = 0.0006
const PAN_FLOOR = 0.5
const CLICK_SLOP = 7
const MAX_PAN_V = 5200

export default function useDragPhysics(targetRef, modeRef, enabled) {
  const rotation = useRef({ x: -0.18, y: 0 })
  const pan = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const wasDrag = useRef(false)
  const last = useRef({ x: 0, y: 0, t: 0 })
  const travelled = useRef(0)
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  useEffect(() => {
    const el = targetRef.current
    if (!el) return
    const down = (e) => {
      if (!enabledRef.current()) return
      if (e.button !== undefined && e.button !== 0) return
      if (e.target.closest?.('[data-no-drag]')) return
      isDragging.current = true
      wasDrag.current = false
      travelled.current = 0
      last.current = { x: e.clientX, y: e.clientY, t: performance.now() }
      velocity.current.x = 0
      velocity.current.y = 0
    }
    const move = (e) => {
      if (!isDragging.current) return
      const now = performance.now()
      const dt = Math.max(1, now - last.current.t) / 1000
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      last.current = { x: e.clientX, y: e.clientY, t: now }
      travelled.current += Math.abs(dx) + Math.abs(dy)
      if (travelled.current > CLICK_SLOP) {
        wasDrag.current = true
        document.documentElement.classList.add('is-dragging')
      }
      if (modeRef.current === 'archive') {
        pan.current.x += dx
        pan.current.y += dy
        velocity.current.x = Math.max(-MAX_PAN_V, Math.min(MAX_PAN_V, dx / dt))
        velocity.current.y = Math.max(-MAX_PAN_V, Math.min(MAX_PAN_V, dy / dt))
      } else {
        rotation.current.y += dx * ROTATE_PER_PX
        rotation.current.x -= dy * ROTATE_PER_PX
        rotation.current.x = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, rotation.current.x))
        velocity.current.y = (dx * ROTATE_PER_PX) / dt
        velocity.current.x = (-dy * ROTATE_PER_PX) / dt
      }
    }
    const up = () => {
      isDragging.current = false
      document.documentElement.classList.remove('is-dragging')
      // let the click that follows a drag see wasDrag, then clear it
      setTimeout(() => { wasDrag.current = false }, 0)
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [targetRef, modeRef])

  /** Per frame; returns true while something is still moving. */
  const update = (delta) => {
    if (isDragging.current) return true
    const v = velocity.current
    const d = Math.min(delta, 0.05)
    if (modeRef.current === 'archive') {
      if (Math.abs(v.x) < PAN_FLOOR && Math.abs(v.y) < PAN_FLOOR) { v.x = 0; v.y = 0; return false }
      pan.current.x += v.x * d
      pan.current.y += v.y * d
      const f = Math.exp(-PAN_FRICTION * d)
      v.x *= f; v.y *= f
      return true
    }
    if (Math.abs(v.x) < VELOCITY_FLOOR && Math.abs(v.y) < VELOCITY_FLOOR) { v.x = 0; v.y = 0; return false }
    rotation.current.x += v.x * d
    rotation.current.y += v.y * d
    if (Math.abs(rotation.current.x) >= MAX_PITCH) {
      rotation.current.x = Math.sign(rotation.current.x) * MAX_PITCH
      v.x = 0
    }
    const f = Math.exp(-ROTATE_FRICTION * d)
    v.x *= f; v.y *= f
    return true
  }

  /** SIGNED archive travel from wheel/keys: becomes velocity so the wall glides
   *  (a step of D px glides ~D px in total). Opposite steps cancel exactly. */
  const nudge = (stepX, stepY) => {
    if (isDragging.current) { pan.current.x += stepX; pan.current.y += stepY; return }
    const v = velocity.current
    v.x = Math.max(-MAX_PAN_V, Math.min(MAX_PAN_V, v.x + stepX * PAN_FRICTION))
    v.y = Math.max(-MAX_PAN_V, Math.min(MAX_PAN_V, v.y + stepY * PAN_FRICTION))
  }
  const stop = () => { velocity.current.x = 0; velocity.current.y = 0 }

  // stable identity: everything inside reads refs, so one object is enough
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ rotation, pan, velocity, isDragging, wasDrag, update, nudge, stop }), [])
}
