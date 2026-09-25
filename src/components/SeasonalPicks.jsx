import { useState } from 'react'
import { Sheet } from './UI.jsx'
import { ProduceCard } from './Produce.jsx'
import { SEASONAL, PRODUCE, monthName, MONTHS_SHORT, seasonOfMonth, seasonalPicks, endingSoon, inSeason, isYearRound, weekNumber } from '../lib/data.js'
import { useApp } from '../lib/context.js'

// SEASONAL RECOMMENDATIONS — a botanical calendar wheel. Twelve month
// "petals" ring the season at the centre; choosing one fills the shelf with
// what's harvested that month. Picks rotate every week.
export default function SeasonalPicks({ onClose }) {
  const { now } = useApp()
  const current = now.getMonth() + 1
  const [month, setMonth] = useState(current)
  const season = seasonOfMonth(month)
  const fresh = PRODUCE.filter((p) => inSeason(p, month) && !isYearRound(p))
  const picks = seasonalPicks(now, 6)
  const ending = endingSoon(now)
  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setMonth((m) => (m % 12) + 1) }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setMonth((m) => ((m + 10) % 12) + 1) }
  }
  return (
    <Sheet title="Seasonal picks" kicker={`Week ${weekNumber(now)} · ${monthName(current)}`} crumbs={[{ label: 'Home', to: '#/' }, { label: 'Seasonal', to: '#/seasonal' }]} onClose={onClose} className="sheet--seasonal">
      <div className="seasonal">
        <div className="wheel-wrap">
          <div className="wheel" style={{ '--season': season.colour }}>
            <div className="wheel__ring" role="radiogroup" aria-label="Choose a month" onKeyDown={onKey}>
              {MONTHS_SHORT.map((mn, i) => {
                const m = i + 1
                const count = PRODUCE.filter((p) => inSeason(p, m) && !isYearRound(p)).length
                return (
                  <button
                    key={mn}
                    type="button"
                    role="radio"
                    aria-checked={month === m}
                    tabIndex={month === m ? 0 : -1}
                    className={`petal${month === m ? ' is-on' : ''}${m === current ? ' is-now' : ''}`}
                    style={{ '--i': i, '--c': seasonOfMonth(m).colour }}
                    onClick={() => setMonth(m)}
                    aria-label={`${monthName(m)}: ${count} crops in season${m === current ? ' (this month)' : ''}`}
                  >
                    <span>{mn}</span>
                  </button>
                )
              })}
            </div>
            <div className="wheel__core" aria-live="polite">
              <p className="wheel__season">{season.name}</p>
              <p className="wheel__month">{monthName(month)}</p>
              <span className="wheel__orn" aria-hidden="true">
                <svg width="22" height="16" viewBox="0 0 22 16"><path d="M11 14C6 12 4 7 5 2c5 1 8 4 6 12Zm0 0c5-2 7-7 6-12-5 1-8 4-6 12Z" fill="var(--season)" fillOpacity=".85" stroke="#23412a" strokeOpacity=".55" strokeWidth=".9" strokeLinejoin="round" /></svg>
              </span>
              <p className="wheel__count">{fresh.length} crops in season</p>
            </div>
          </div>
          <div className="wheel-text">
            <h2>{season.headline}</h2>
            <p>{season.blurb}</p>
            <p className="tip"><img src="/assets/sprites/sprig-1.webp" alt="" width="28" /><span><strong>Tip: </strong>{season.tip}</span></p>
            {month !== current && <button type="button" className="text-btn" onClick={() => setMonth(current)}>Back to this month</button>}
          </div>
        </div>

        <section className="shelf" aria-labelledby="fresh-h">
          <h2 id="fresh-h">{month === current ? 'Fresh this month' : `Fresh in ${monthName(month)}`}</h2>
          <p className="shelf__lede">{fresh.length} crops at the markets{month === current ? ' right now' : ''}.</p>
          <div className="packets">
            {fresh.map((p) => <ProduceCard key={p.id} p={p} />)}
          </div>
        </section>

        <section className="shelf" aria-labelledby="week-h">
          <h2 id="week-h">This week’s picks</h2>
          <p className="shelf__lede">Chosen from what’s in season, and refreshed every Monday.</p>
          <div className="packets packets--picks">{picks.map((p) => <ProduceCard key={p.id} p={p} label="Seasonal pick" />)}</div>
        </section>

        {ending.length > 0 && (
          <section className="shelf" aria-labelledby="last-h">
            <h2 id="last-h">Last chance</h2>
            <p className="shelf__lede">Their season ends soon — catch them at the market in the next few weeks.</p>
            <div className="packets">{ending.slice(0, 6).map((p) => <ProduceCard key={p.id} p={p} label="Ending soon" />)}</div>
          </section>
        )}

        <section className="seasons" aria-labelledby="yr-h">
          <h2 id="yr-h">The market year</h2>
          <ul>
            {SEASONAL.seasons.map((s) => (
              <li key={s.id} className={s.months.includes(current) ? 'is-now' : ''} style={{ '--c': s.colour }}>
                <h3>{s.name}{s.months.includes(current) && <small>now</small>}</h3>
                <p>{s.blurb}</p>
              </li>
            ))}
          </ul>
          <p className="fine">Local crops follow Qatar’s growing year, which peaks in the cool months (about November to April); fruit from regional orchards follows its own harvest.</p>
        </section>
      </div>
    </Sheet>
  )
}
