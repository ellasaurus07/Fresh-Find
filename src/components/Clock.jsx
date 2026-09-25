import useNow from '../hooks/useNow.js'
import { MARKETS } from '../lib/data.js'
import { currentSlot } from '../lib/schedule.js'
import Icon from './Icon.jsx'

// The real-time clock doubles as the "open right now" signal: it counts the
// markets trading at this very minute and links to them.
export default function Clock({ compact = false }) {
  const now = useNow(1000)
  const open = MARKETS.filter((m) => currentSlot(m, now)).length
  const date = now.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
  const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: compact ? undefined : '2-digit' })
  return (
    <a className="clock" href="#/markets?open=1" aria-label={`${date}, ${time}. ${open} ${open === 1 ? 'market' : 'markets'} open now. Show open markets.`} data-cursor="view">
      <Icon name="clock" size={16} />
      <time dateTime={now.toISOString()} aria-hidden="true"><span className="clock__date">{date} · </span>{time}</time>
      <span className={`clock__open${open ? ' is-live' : ''}`} aria-hidden="true">{open} open now</span>
    </a>
  )
}
