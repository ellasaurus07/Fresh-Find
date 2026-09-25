// ---------------------------------------------------------------------------
// WHEEL MATHS — pure, signed, testable without a browser (see test/wheel.test.mjs).
//
// Ported from the original engine. The archive must never lose the sign of a
// gesture: nothing here takes Math.abs of a delta, clamps it to be
// non-negative, or remembers a "forward" direction. Units are CSS pixels.
// ---------------------------------------------------------------------------
export const MAX_EVENT_DELTA = 140
export const LINE_HEIGHT = 16
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

/** Convert any wheel event to signed pixels, clamped per axis. */
export function normalizeWheel(e, viewport = { w: 1280, h: 800 }) {
  let dx = e.deltaX || 0
  let dy = e.deltaY || 0
  if (e.deltaMode === 1) { dx *= LINE_HEIGHT; dy *= LINE_HEIGHT }
  else if (e.deltaMode === 2) { dx *= viewport.w; dy *= viewport.h }
  // Shift + wheel on a mouse means "horizontal"
  if (e.shiftKey && dx === 0) { dx = dy; dy = 0 }
  return { dx: clamp(dx, -MAX_EVENT_DELTA, MAX_EVENT_DELTA), dy: clamp(dy, -MAX_EVENT_DELTA, MAX_EVENT_DELTA) }
}

export const ARCHIVE_PX_PER_WHEEL_PX = 1.15

/**
 * One wheel event -> archive travel, SIGNED (screen y points down):
 *   deltaY > 0 (scroll down)  -> wall moves up    -> pan.y decreases
 *   deltaY < 0 (scroll up)    -> wall moves down  -> pan.y increases
 *   deltaX > 0 (swipe left)   -> wall moves left  -> pan.x decreases
 * Reversing the gesture reverses the step exactly: archiveStep(-dx,-dy) = -archiveStep(dx,dy).
 */
export function archiveStep(dx, dy) {
  return { x: -dx * ARCHIVE_PX_PER_WHEEL_PX, y: -dy * ARCHIVE_PX_PER_WHEEL_PX }
}
