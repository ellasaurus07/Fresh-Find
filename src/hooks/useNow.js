import { useEffect, useState } from 'react'
// The real browser clock. `every` ms controls how often dependants re-render:
// the visible clock ticks each second; open/closed status each 30 s.
export default function useNow(every = 30000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let id
    const tick = () => {
      setNow(new Date())
      const d = new Date()
      // align to the next boundary so "Open now" flips exactly on the minute
      const ms = every >= 60000 ? 60000 - (d.getSeconds() * 1000 + d.getMilliseconds()) : every - (d.getMilliseconds() % every)
      id = setTimeout(tick, ms)
    }
    id = setTimeout(tick, every - (Date.now() % every))
    return () => clearTimeout(id)
  }, [every])
  return now
}
