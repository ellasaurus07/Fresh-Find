import { forwardRef, memo } from 'react'

// One tile of the world. The SAME element is a photo on the globe, a card on
// the curved wall, and the start of the flight into a detail view. Its info
// panel is revealed by the world's --reveal variable (0 on the globe, 1 in
// the archive), so no per-tile React updates are needed while morphing.
const MarketTile = forwardRef(function MarketTile({ tile, hidden, hovered, onClick, onEnter, onLeave, onFocus, onBlur }, ref) {
  return (
    <a
      ref={ref}
      role="listitem"
      href={tile.href}
      className={`tile tile--${tile.kind}${hovered ? ' is-hover' : ''}${tile.open ? ' is-open' : ''}`}
      style={tile.tint ? { '--tint': tile.tint } : undefined}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden || undefined}
      aria-label={tile.label}
      data-cursor={tile.kind === 'market' ? 'open' : 'view'}
      onClick={(e) => onClick(e, tile)}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onEnter()}
      onPointerLeave={onLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      draggable={false}
    >
      <span className="tile__photo">
        <img src={tile.img} alt="" loading="lazy" decoding="async" draggable={false} width="360" height="270" />
      </span>
      {tile.badge && <span className={`tile__badge tile__badge--${tile.badge.tone}`}>{tile.badge.text}</span>}
      <span className="tile__info">
        <span className="tile__kicker">{tile.kicker}</span>
        <strong className="tile__title">{tile.title}</strong>
        <span className="tile__meta">{tile.meta}</span>
        {tile.chips?.length > 0 && (
          <span className="tile__chips">
            {tile.chips.map((c) => <span key={c}>{c}</span>)}
          </span>
        )}
        <span className="tile__foot">{tile.foot}</span>
      </span>
    </a>
  )
})
export default memo(MarketTile)
