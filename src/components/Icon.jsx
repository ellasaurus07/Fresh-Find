// Hand-tuned line icons (stroke = currentColor) — no icon font, no network.
const P = {
  search: 'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zm5.3-2.2L21 21',
  close: 'M6 6l12 12M18 6L6 18',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  back: 'M20 12H5m6-6-6 6 6 6',
  left: 'M15 5l-7 7 7 7',
  right: 'M9 5l7 7-7 7',
  heart: 'M12 20s-7.5-4.6-9.2-9.3C1.6 7.4 3.8 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.2 0 5.4 2.9 4.2 6.2C19.5 15.4 12 20 12 20z',
  share: 'M16 6l-4-4-4 4M12 2v13M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  clock: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-13v4.5l3 2',
  chat: 'M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5z',
  menu: 'M4 7h16M4 12h16M4 17h10',
  leaf: 'M5 19C4 11 9 5 20 4c0 11-6 16-13 16M5 19c3-5 6-8 10-10',
  globe: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM3.5 9h17M3.5 15h17M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  basket: 'M3 10h18l-2 10H5zM7 10l4-6m6 6-4-6M9 14v3m6-3v3',
  sprout: 'M12 21v-9m0 0C12 7 8 5 4 5c0 4 3 7 8 7zm0-2c0-4 3-7 8-7 0 4-3 7-8 7',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v5m8-5v5',
  bookmark: 'M6 3h12v18l-6-5-6 5z',
  download: 'M12 3v12m-5-5 5 5 5-5M4 20h16',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  locate: 'M12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-4a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-12v2m0 14v2m9-9h-2M5 12H3',
  mail: 'M3 6h18v12H3zm0 0 9 7 9-7',
  phone: 'M5 3h4l2 5-3 2a11 11 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2',
  user: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm-8 9c.8-4 4-6 8-6s7.2 2 8 6',
  unfold: 'M4 12c0-4 3.6-7 8-7s8 3 8 7M4 12l-2 3m2-3 3 2m13-2 2 3m-2-3-3 2M8 19h8',
  print: 'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-14v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19',
  filter: 'M4 6h16M7 12h10M10 18h4',
}
export default function Icon({ name, size = 20, className = '', title }) {
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : 'true'} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      <path d={P[name] || P.leaf} />
    </svg>
  )
}
