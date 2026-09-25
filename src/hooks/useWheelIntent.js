import { useEffect, useRef } from 'react'
import { normalizeWheel, archiveStep } from './wheelMath.js'

// ---------------------------------------------------------------------------
// WHEEL / TRACKPAD INTENT — split strictly by world mode (ported).
//
//   'globe' | 'morphing' : the gesture drives the globe -> archive unfold.
//                          First-gesture calibration lives ONLY here.
//   'archive'            : raw SIGNED deltas pan the archive. No calibration,
//                          no direction lock, and it can never touch morph.
//   anything else        : ignored (a sheet/detail is open).
// ---------------------------------------------------------------------------
const GESTURE_IDLE_MS = 150
const SETTLE_MS = 200
const INTENT_THRESHOLD = 7
const MOUSE_SENSITIVITY = 0.0034
const TRACKPAD_SENSITIVITY = 0.0016
const FIRST_EVENT_KICK = 0.05

function looksContinuous(e) {
  if (e.deltaMode !== 0) return false
  if (!Number.isInteger(e.deltaY)) return true
  if (e.deltaX !== 0) return true
  return Math.abs(e.deltaY) < 50
}

export default function useWheelIntent(targetRef, opts) {
  const optsRef = useRef(opts)
  optsRef.current = opts
  const globeForward = useRef(0)
  const lastEventAt = useRef(0)
  const gesture = useRef({ accum: 0, lockSign: 0, continuous: false, kicked: false })
  const settleTimer = useRef(null)

  useEffect(() => {
    const el = targetRef.current
    if (!el) return
    const startGesture = () => Object.assign(gesture.current, { accum: 0, lockSign: 0, continuous: false, kicked: false })
    const scheduleSettle = () => {
      clearTimeout(settleTimer.current)
      settleTimer.current = setTimeout(() => optsRef.current.onSettle?.(), SETTLE_MS)
    }
    const onWheel = (e) => {
      const o = optsRef.current
      if (!o.enabled()) return
      e.preventDefault()
      const mode = o.getMode()
      const { dx, dy } = normalizeWheel(e, { w: window.innerWidth, h: window.innerHeight })

      if (mode === 'archive') {
        const step = archiveStep(dx, dy)
        o.applyArchive(step.x, step.y)
        return
      }
      if (mode === 'morphing' && o.isTweening()) return
      if (mode !== 'globe' && mode !== 'morphing') return

      const now = performance.now()
      if (now - lastEventAt.current > GESTURE_IDLE_MS) startGesture()
      lastEventAt.current = now
      const g = gesture.current
      if (looksContinuous(e)) g.continuous = true
      g.accum += dy
      if (g.lockSign === 0) {
        if (Math.abs(g.accum) < INTENT_THRESHOLD) return
        g.lockSign = Math.sign(g.accum)
        if (globeForward.current === 0) globeForward.current = g.lockSign
      }
      // momentum tails emit opposite-sign crumbs inside one gesture: ignore them
      if (Math.sign(dy) !== g.lockSign) { scheduleSettle(); return }
      const toward = g.lockSign === globeForward.current ? 1 : -1
      let step = Math.abs(dy) * (g.continuous ? TRACKPAD_SENSITIVITY : MOUSE_SENSITIVITY)
      if (!g.kicked) { g.kicked = true; step += FIRST_EVENT_KICK }
      o.applyMorph(step * toward)
      scheduleSettle()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      clearTimeout(settleTimer.current)
    }
  }, [targetRef])
}
