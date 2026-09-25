import { useEffect, useState } from 'react'
// SIMULATED visitor counter (SRS): a running total in localStorage, counted
// once per browser session (a sessionStorage flag stops refreshes inflating it).
const COUNT_KEY = 'freshfind.visitorCount'
const SEEN_KEY = 'freshfind.countedThisSession'
const BASELINE = 18240
export default function useVisitorCounter() {
  const [count, setCount] = useState(null)
  useEffect(() => {
    let current = BASELINE
    try {
      const stored = Number(localStorage.getItem(COUNT_KEY))
      if (Number.isFinite(stored) && stored > 0) current = stored
    } catch (_) { /* storage blocked */ }
    let counted = false
    try { counted = sessionStorage.getItem(SEEN_KEY) === '1' } catch (_) { /* blocked */ }
    if (!counted) {
      current += 1
      try { localStorage.setItem(COUNT_KEY, String(current)); sessionStorage.setItem(SEEN_KEY, '1') } catch (_) { /* ignore */ }
    }
    setCount(current)
  }, [])
  return count
}
