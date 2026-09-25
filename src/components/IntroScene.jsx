import { useState } from 'react'
import QuickFind from './QuickFind.jsx'
import FeaturedShowcase from './FeaturedShowcase.jsx'
import Icon from './Icon.jsx'
import Vines from './Vines.jsx'
import { useApp } from '../lib/context.js'
import { go, withQuery } from '../lib/router.js'

export function LeafMark({ size = 36 }) {
  return (
    <svg className="leafmark" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 40C6 22 18 8 42 6c1 22-12 34-30 34" fill="#6f9a3c" stroke="#23412a" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M9 39c7-10 15-19 26-26M20 28l-1-8M26 22l6 1" fill="none" stroke="#23412a" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

// HOME — the arrival. The brand is painted onto the wooden sign of the market
// arch; the path leads through the arch into the greenhouse (the globe).
// The sign lives on a layer with exactly the same box and transform as the
// painted plate, so the title and the background zoom as one surface.
// `returning` = arriving back from the market world (plays the zoom-out).
export default function IntroScene({ onEnter, highlights, returning = false, leaving = false }) {
  const { geo, reduced } = useApp()
  const [ret] = useState(returning) // fixed for this visit so the entrance never restarts mid-way
  return (
    <main className={`intro${ret ? ' intro--return' : ''}${leaving ? ' is-leaving' : ''}`} id={leaving ? undefined : 'main'} aria-hidden={leaving || undefined}>
      <div className="intro__sign-layer">
        <h1 className="intro__brand">
          <span className="intro__word">Fresh<span>Find</span></span>
          <LeafMark size={52} />
          <span className="sr-only">: farmers markets in Qatar</span>
        </h1>
      </div>

      <div className="intro__stage">
      <div className="intro__panel">
        {/* four mirrored sprigs: the box is symmetrical, so nothing looks missing on either side */}
        <span className="intro__sprig intro__sprig--tl" aria-hidden="true"><Vines variant="sprig" delay={520} /></span>
        <span className="intro__sprig intro__sprig--tr" aria-hidden="true"><Vines variant="sprig" delay={600} /></span>
        <span className="intro__sprig intro__sprig--bl" aria-hidden="true"><Vines variant="sprig" delay={680} /></span>
        <span className="intro__sprig intro__sprig--br" aria-hidden="true"><Vines variant="sprig" delay={760} /></span>
        <p className="intro__tagline">Fresh All Along</p>
        <p className="intro__lede">
          Every farmers market across Doha and Qatar in one living guide — when each one is open, what’s on the stalls, and what’s in season this week.
        </p>
        <div className="intro__ctas">
          <button type="button" className="btn btn--primary btn--lg" onClick={onEnter} data-cursor="open">
            <span>Enter the market</span><Icon name="arrow" />
          </button>
          <a className="btn btn--quiet" href="#/markets">Browse all markets</a>
        </div>
        <QuickFind
          className="intro__find"
          onSubmit={(v) => go(withQuery('#/markets', v))}
          onLocate={() => { geo.request(); go('#/markets?sort=near') }}
          locating={geo.status === 'locating'}
        />
        <ul className="intro__values" aria-label="What FreshFind helps you do">
          <li><Icon name="pin" size={16} />Find local markets</li>
          <li><Icon name="sprout" size={16} />Discover seasonal produce</li>
          <li><Icon name="basket" size={16} />Support local farmers</li>
        </ul>
      </div>
      </div>

      <FeaturedShowcase items={highlights} reduced={reduced} className="intro__showcase" />
      <p className="intro__note" aria-hidden="true">Fresh food · stronger communities</p>
    </main>
  )
}
