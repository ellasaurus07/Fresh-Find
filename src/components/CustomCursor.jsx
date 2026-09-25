import { useEffect, useRef } from 'react'
// A seed-shaped cursor companion with a handwritten verb: ROTATE / DRAG /
// VIEW / OPEN / SAVE, read from the nearest [data-cursor]. Fine pointers only.
const LABEL = { rotate: 'Rotate', drag: 'Drag', view: 'View', open: 'Open', save: 'Save' }
export default function CustomCursor({ reduced }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return
    const el = ref.current
    document.documentElement.classList.add('has-cursor')
    let x = -100, y = -100, cx = x, cy = y, raf = 0, mode = ''
    const move = (e) => {
      x = e.clientX; y = e.clientY
      const t = e.target.closest?.('[data-cursor]')
      const m = t && !e.target.closest('input,select,textarea,.sheet,.chat__panel,.search') ? t.dataset.cursor : ''
      if (m !== mode) {
        mode = m
        el.dataset.mode = m
        el.querySelector('span').textContent = LABEL[m] || ''
      }
    }
    const leave = () => { x = -100; y = -100 }
    const tick = () => {
      raf = requestAnimationFrame(tick)
      cx += (x - cx) * 0.28
      cy += (y - cy) * 0.28
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [reduced])
  if (reduced) return null
  return <div ref={ref} className="cursor" aria-hidden="true"><i /><span /></div>
}
