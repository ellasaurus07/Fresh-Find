// Card -> detail continuity, kept deliberately small.
// The detail's own hero image settles into place: it starts a short way from
// the direction of the card that was clicked (a fraction of the real distance,
// capped), slightly smaller and transparent, then eases home. No copy of the
// image travels across the interface, so nothing oversized flies over the UI.
export function settleIn(el, from, { reduced = false, duration = 560 } = {}) {
  return new Promise((resolve) => {
    if (!el || reduced || typeof el.animate !== 'function') return resolve()
    const to = el.getBoundingClientRect()
    let dx = 0, dy = 0
    if (from && to.width) {
      const cap = 36
      dx = Math.max(-cap, Math.min(cap, ((from.left + from.width / 2) - (to.left + to.width / 2)) * 0.08))
      dy = Math.max(-cap, Math.min(cap, ((from.top + from.height / 2) - (to.top + to.height / 2)) * 0.08))
    }
    const anim = el.animate(
      [
        { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(0.94)`, opacity: 0 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      ],
      { duration, delay: 90, easing: 'cubic-bezier(.22,.8,.3,1)', fill: 'backwards' }
    )
    anim.onfinish = () => resolve()
    anim.oncancel = () => resolve()
  })
}
