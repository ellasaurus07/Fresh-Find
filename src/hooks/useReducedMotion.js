import { useEffect, useState } from 'react'
const query = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)')
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(() => !!query()?.matches)
  useEffect(() => {
    const mq = query()
    const on = (e) => setReduced(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}
