// Additional FreshFind produce illustrations (Qatar content expansion) — same
// ink + wash language and helpers as art.js. Rendered by render.mjs.
const INK = '#4a3421'
const s = (o = {}) => `stroke="${INK}" stroke-width="${o.w || 3}" stroke-linejoin="round" stroke-linecap="round"`
const hi = (cx, cy, rx, ry, r = -25) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".38" transform="rotate(${r} ${cx} ${cy})"/>`
const leaf = (d, fill = '#6f9a3c') => `<path d="${d}" fill="${fill}" ${s({ w: 2.5 })}/>`
const vein = (d) => `<path d="${d}" fill="none" stroke="#3f5e22" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`
const oval = (cx, cy, rx, ry, rot, fill, w = 2.6) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${s({ w })} transform="rotate(${rot} ${cx} ${cy})"/>`
const stem = (d, c = '#7a5230', w = 3) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`
const tie = (x, y) => `<path d="M${x - 16} ${y}c10 6 22 6 32 0l-2 10c-9 5-19 5-28 0z" fill="#c9a06a" ${s({ w: 2.2 })}/>`
const bunch = (stems, leaves, tieY = 150) => `${stems}${leaves}${tie(100, tieY)}`

export const ART = {
  dates: `
    ${stem('M100 26c0 20-4 34-12 46M100 26c2 22 8 36 20 46M100 26c-8 18-20 30-34 38M100 26c10 16 22 26 36 34', '#b0823f', 3.4)}
    ${leaf('M100 28C84 16 66 14 52 20c14 8 30 12 48 8z', '#7aa743')}${leaf('M100 28c14-14 32-18 48-12-14 10-30 14-48 12z')}
    ${[[70, 86, -20], [96, 84, 0], [124, 84, 18], [58, 118, -14], [84, 116, -6], [112, 114, 8], [138, 112, 16], [72, 150, -10], [100, 148, 0], [128, 146, 10], [100, 178, 0]]
      .map(([x, y, r], i) => oval(x, y, 12, 19, r, ['#8a4a22', '#a0582a', '#7a3f1c'][i % 3]) + hi(x - 4, y - 7, 3, 7, r)).join('')}`,
  pomegranate: `
    <circle cx="100" cy="122" r="60" fill="#b8322f" ${s()}/>
    <path d="M62 150c16 22 50 30 78 12" fill="none" stroke="#7d1f1c" stroke-width="7" opacity=".35" stroke-linecap="round"/>
    <path d="M84 66l4-18 7 12 5-16 5 16 7-12 4 18z" fill="#9a2a26" ${s({ w: 2.4 })}/>
    ${hi(76, 100, 16, 9, -30)}`,
  mango: `
    <path d="M58 92c10-36 62-46 88-18 22 24 18 72-10 94-28 22-74 12-84-20-4-16 0-40 6-56z" fill="#f2b233" ${s()}/>
    <path d="M70 88c16-24 46-30 66-12" fill="none" stroke="#e0663a" stroke-width="18" opacity=".4" stroke-linecap="round"/>
    ${hi(78, 110, 10, 22, 18)}
    ${stem('M118 64c2-8 6-14 12-18', '#5b3a1f', 4)}
    ${leaf('M128 48c16-12 36-12 46-2-14 8-30 10-46 2z')}${vein('M130 47c14-2 26-2 38 0')}`,
  grapes: `
    ${stem('M104 40c0-10 4-16 10-20', '#5b3a1f', 4)}
    ${leaf('M108 38c12-18 34-22 50-12-10 16-30 20-50 12z', '#7aa743')}${vein('M112 36c14-4 26-6 40-6')}
    ${[[76, 64], [100, 62], [124, 64], [66, 88], [90, 86], [114, 86], [136, 90], [78, 110], [102, 110], [126, 112], [90, 134], [114, 134], [102, 158]]
      .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="14" fill="${i % 3 ? '#7b4a8c' : '#6a3b7c'}" ${s({ w: 2.4 })}/>${hi(x - 5, y - 5, 4, 2.4)}`).join('')}`,
  oranges: `
    ${[[74, 128, 44, '#f08a24'], [132, 118, 40, '#f59a30']].map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${s()}/>${[[-14, -8], [8, -16], [14, 10], [-8, 16], [0, 0]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="1.6" fill="#b85a14" opacity=".6"/>`).join('')}${hi(x - r / 3, y - r / 3, r / 4, r / 7)}`).join('')}
    ${stem('M134 78c0-6 2-10 6-12', '#5b3a1f', 3)}
    ${leaf('M138 70c10-14 28-16 38-8-10 10-24 12-38 8z')}`,
  guava: `
    <path d="M70 70c-22 8-34 34-28 62 6 30 30 46 56 44 26-2 42-24 40-54-2-30-26-60-68-52z" fill="#a7c95e" ${s()}/>
    ${hi(66, 104, 8, 20, 18)}
    <circle cx="146" cy="142" r="36" fill="#a7c95e" ${s()}/><circle cx="146" cy="142" r="28" fill="#f28c8c" ${s({ w: 2 })}/>
    ${[[138, 134], [152, 132], [146, 148], [136, 150], [158, 146], [146, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#f7e3c0" stroke="${INK}" stroke-width="1"/>`).join('')}
    ${stem('M78 70c0-8 4-14 10-18', '#5b3a1f', 4)}`,
  mulberries: `
    ${[[70, 120, -16], [104, 112, 4], [138, 124, 18]].map(([x, y, r]) => `${oval(x, y, 18, 32, r, '#4a1f3a')}${[[-6, -16], [6, -12], [-8, -2], [6, 2], [-4, 12], [8, 16], [0, -24], [0, 24]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="5" fill="#62284c" stroke="${INK}" stroke-width="1.2" transform="rotate(${r} ${x} ${y})"/>`).join('')}${stem(`M${x} ${y - 32}c0-8 2-12 6-16`, '#6f9a3c', 3)}`).join('')}
    ${leaf('M86 180c18-12 40-12 58-2-18 10-40 12-58 2z', '#7aa743')}`,
  melon: `
    <ellipse cx="94" cy="122" rx="66" ry="56" fill="#e7d27a" ${s()}/>
    <path d="M40 110c30 14 80 14 110-2M36 132c34 12 86 12 118-4M60 80c10 30 10 64-4 94M100 68c6 34 6 72 0 110M134 76c-6 30-4 66 10 94" fill="none" stroke="#b09a48" stroke-width="2" opacity=".7"/>
    ${hi(66, 94, 16, 8)}
    <path d="M122 176l40-50c10 14 10 34-4 48-10 8-24 8-36 2z" fill="#f2a060" ${s()}/><path d="M126 172l34-42" stroke="#e7d27a" stroke-width="5"/>`,
  okra: `
    ${[[60, -24, '#6ea43c'], [100, -4, '#5f9636'], [140, 18, '#79ad45']].map(([x, r, c]) => `<g transform="rotate(${r} ${x} 110)"><path d="M${x - 14} 70c-2 40 6 80 14 108 8-28 16-68 14-108z" fill="${c}" ${s()}/><path d="M${x - 5} 76c0 36 3 66 5 94M${x + 5} 76c0 36-3 66-5 94" stroke="#3f6b2a" stroke-width="1.6" fill="none"/><path d="M${x - 14} 70c4-10 24-10 28 0-6 6-22 6-28 0z" fill="#4f7d2c" ${s({ w: 2 })}/>${stem(`M${x} 64c0-8 2-14 6-18`, '#4f7d2c', 4)}</g>`).join('')}`,
  zucchini: `
    ${[[-28, 96, '#3f7a34'], [-12, 118, '#4f8a3a']].map(([r, y, c]) => `<g transform="rotate(${r} 100 ${y})"><rect x="30" y="${y - 16}" width="140" height="34" rx="17" fill="${c}" ${s()}/><path d="M44 ${y - 6}h110M44 ${y + 8}h110" stroke="#a9cf7a" stroke-width="3" stroke-dasharray="10 8" opacity=".6"/><rect x="164" y="${y - 7}" width="16" height="14" rx="4" fill="#8aa55a" ${s({ w: 2 })}/></g>`).join('')}`,
  cauliflower: `
    ${leaf('M44 150c-10-30 4-60 30-66-6 24-8 48-2 70z', '#5f8f34')}${leaf('M156 150c10-30-4-60-30-66 6 24 8 48 2 70z', '#6f9a3c')}
    ${[[80, 92, 22], [112, 86, 24], [66, 118, 20], [98, 114, 24], [132, 114, 22], [84, 140, 20], [116, 140, 20]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f4eedc" ${s({ w: 2.4 })}/><circle cx="${x - 5}" cy="${y - 4}" r="${r * 0.35}" fill="#fff" opacity=".6"/>`).join('')}
    ${leaf('M56 170c20-16 70-18 90 0-24 14-66 14-90 0z', '#7aa743')}`,
  cabbage: `
    <circle cx="100" cy="118" r="64" fill="#9cc46a" ${s()}/>
    <path d="M100 58c-26 18-34 60-10 120M100 58c26 18 34 60 10 120M52 90c30 6 50 30 52 88M148 90c-30 6-50 30-52 88" fill="none" stroke="#5f8f34" stroke-width="2.4" opacity=".8"/>
    <path d="M40 118c-4-40 22-66 50-70-16 20-30 44-30 80z" fill="#b6d886" ${s({ w: 2.4 })}/>
    ${hi(120, 84, 14, 7, 20)}`,
  potatoes: `
    ${[[70, 136, 38, 28, -12, '#c9a06a'], [128, 128, 36, 26, 14, '#d4ae78'], [100, 96, 30, 22, -4, '#c49a62']].map(([x, y, rx, ry, r, c]) => `<path d="M${x - rx} ${y}c0-${ry} ${rx * 0.6}-${ry * 1.1} ${rx}-${ry}s${rx} ${ry * 0.4} ${rx} ${ry}-${rx * 0.5} ${ry}-${rx} ${ry}-${rx}-${ry * 0.2}-${rx}-${ry}z" fill="${c}" ${s()} transform="rotate(${r} ${x} ${y})"/>${[[-12, -6], [10, 4], [-2, 10]].map(([dx, dy]) => `<path d="M${x + dx - 3} ${y + dy}c2 2 4 2 6 0" stroke="${INK}" stroke-width="1.6" fill="none"/>`).join('')}`).join('')}`,
  onions: `
    ${[[74, '#c98a4a', '#a86a30'], [128, '#9a3a55', '#7a2640']].map(([x, c, d]) => `<path d="M${x} 64c-6 18-44 34-44 74 0 28 20 42 44 42s44-14 44-42c0-40-38-56-44-74z" fill="${c}" ${s()}/><path d="M${x - 20} 100c-6 20-4 50 10 72M${x} 90c-2 30-2 60 0 88M${x + 20} 100c6 20 4 50-10 72" stroke="${d}" stroke-width="2" fill="none" opacity=".8"/>${stem(`M${x} 64c-2-14-8-24-14-30M${x} 64c2-14 6-24 12-32`, '#6f9a3c', 3.4)}${hi(x - 18, 124, 5, 14, 12)}`).join('')}`,
  'green-beans': `
    ${[-30, -16, -2, 12, 26].map((r, i) => `<g transform="rotate(${r} 100 170)"><path d="M96 40c-6 40-6 90 0 130 6-40 10-90 8-130-2-4-6-4-8 0z" fill="${i % 2 ? '#6fa843' : '#5f9636'}" ${s({ w: 2.2 })}/>${[70, 96, 122, 146].map((y) => `<circle cx="100" cy="${y}" r="2" fill="#3f6b2a"/>`).join('')}</g>`).join('')}
    ${tie(100, 140)}`,
  lettuce: `
    ${leaf('M100 180C60 170 44 120 58 60c14 10 30 50 42 120z', '#8cbf55')}
    ${leaf('M100 180c40-10 56-60 42-120-14 10-30 50-42 120z', '#8cbf55')}
    ${leaf('M100 182C78 150 76 90 92 36c10 20 18 60 8 146z', '#a8d06a')}
    ${leaf('M100 182c22-32 24-92 8-146-10 20-18 60-8 146z', '#9ccb5e')}
    ${vein('M100 176V52M82 120l18 16M118 120l-18 16M84 90l16 14M116 90l-16 14')}`,
  chili: `
    ${[[64, -20, '#d8342a'], [100, 0, '#4f8a3a'], [136, 20, '#e0452c']].map(([x, r, c]) => `<g transform="rotate(${r} ${x} 110)"><path d="M${x - 10} 64c-10 30-6 74 10 116 4-10 14-60 12-100-1-10-4-16-8-18z" fill="${c}" ${s()}/>${hi(x - 4, 100, 3, 16, 4)}<path d="M${x - 12} 64c4-8 14-8 18 0z" fill="#4f7d2c" ${s({ w: 2 })}/>${stem(`M${x - 3} 60c0-10 4-16 10-20`, '#4f7d2c', 4)}</g>`).join('')}`,
  'sweet-potato': `
    ${[[-18, 108, '#b5563a'], [14, 140, '#c4633f']].map(([r, y, c]) => `<g transform="rotate(${r} 100 ${y})"><path d="M28 ${y}c20-26 110-30 144-4-20 26-116 30-144 4z" fill="${c}" ${s()}/><path d="M60 ${y - 8}c6 4 10 4 16 0M110 ${y + 6}c6 4 10 4 16 0" stroke="${INK}" stroke-width="1.6" fill="none"/>${hi(80, y - 10, 20, 4, 0)}</g>`).join('')}`,
  coriander: bunch(
    stem('M100 150L72 60M100 150L94 44M100 150l14-100M100 150l32-80M100 150l-44-54', '#5f8f34', 2.6),
    [[72, 60], [94, 44], [114, 50], [132, 70], [56, 96], [84, 80], [118, 88]].map(([x, y]) => `<path d="M${x} ${y - 14}c10 0 16 8 12 14 8 2 8 14 0 16-2 8-14 10-18 2-8 2-14-8-8-14-6-8 2-18 14-18z" fill="#6f9a3c" ${s({ w: 2 })}/>`).join('')),
  dill: bunch(
    stem('M100 150L76 50M100 150L100 36M100 150l26-100M100 150l-40-70M100 150l44-66', '#6f8f3c', 2.6),
    [[76, 50], [100, 36], [126, 50], [60, 80], [144, 84]].map(([x, y]) => [0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => `<path d="M${x} ${y}l${(Math.cos(a * Math.PI / 180) * 22).toFixed(1)} ${(Math.sin(a * Math.PI / 180) * 22).toFixed(1)}" stroke="#7aa743" stroke-width="2.2" stroke-linecap="round"/>`).join('') + `<circle cx="${x}" cy="${y}" r="3" fill="#e8c13a" ${s({ w: 1.2 })}/>`).join('')),
  jarjeer: bunch(
    stem('M100 150L74 58M100 150L98 40M100 150l22-98M100 150l-38-60M100 150l40-66', '#5f8f34', 2.6),
    [[74, 58, -20], [98, 40, 0], [122, 52, 18], [62, 90, -34], [140, 84, 30]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})"><path d="M${x} ${y - 30}c10 4 4 10 12 14-6 4-2 10 8 12-8 6-10 12-4 18-8 2-12 8-16 14-4-6-8-12-16-14 6-6 4-12-4-18 10-2 14-8 8-12 8-4 2-10 12-14z" fill="#5d8e36" ${s({ w: 2 })}/></g>`).join('')),
  purslane: bunch(
    stem('M100 150L70 70M100 150L96 48M100 150l24-90M100 150l-40-50M100 150l42-60', '#b5563a', 3),
    [[70, 70], [96, 48], [124, 60], [60, 100], [142, 90], [84, 96], [114, 90], [78, 118], [124, 116]].map(([x, y], i) => `${oval(x - 8, y, 6, 11, -30, '#7aab4a', 2)}${oval(x + 8, y, 6, 11, 30, '#6f9a3c', 2)}`).join('')),
  labneh: `
    <path d="M30 118h140c-4 36-32 58-70 58s-66-22-70-58z" fill="#e9d9b8" ${s()}/>
    <path d="M30 118c10-12 130-12 140 0-10 10-130 10-140 0z" fill="#d7c29a" ${s({ w: 2.4 })}/>
    <path d="M52 116c6-24 30-34 48-30 18-6 42 6 48 30-30 8-66 8-96 0z" fill="#fbf6ea" ${s({ w: 2.4 })}/>
    <path d="M70 108c14-10 30 6 44-4 8-6 18-2 22 4" fill="none" stroke="#d9cfb4" stroke-width="3"/>
    <path d="M82 110c10 4 24 4 34-2" fill="none" stroke="#c9a52a" stroke-width="4" opacity=".7" stroke-linecap="round"/>
    ${leaf('M110 92c8-10 22-12 30-6-8 8-20 10-30 6z', '#5f8f34')}`,
  'camel-milk': `
    <path d="M80 30h40v18c0 8 18 20 18 44v76c0 8-6 12-12 12H74c-6 0-12-4-12-12V92c0-24 18-36 18-44z" fill="#fbf8ef" ${s()}/>
    <rect x="76" y="20" width="48" height="14" rx="4" fill="#c9a06a" ${s({ w: 2.4 })}/>
    <path d="M66 116h68v34H66z" fill="#efdcb6" ${s({ w: 2.2 })}/>
    <path d="M72 144c10-8 18-8 26-2 10-8 20-8 30 0" fill="none" stroke="#b98a52" stroke-width="3"/>
    <path d="M84 132c2-6 6-8 10-6 2-6 8-6 10 0h4c2 0 2 4 0 6h-24z" fill="#8c6a45"/>
    ${hi(76, 80, 4, 18, 8)}`,
  laban: `
    <path d="M70 44h60l6 20v104c0 8-6 12-12 12H76c-6 0-12-4-12-12V64z" fill="#f7f3e8" ${s()}/>
    <rect x="74" y="28" width="52" height="18" rx="4" fill="#3f7a78" ${s({ w: 2.4 })}/>
    <path d="M64 96h72v44H64z" fill="#cfe3e0" ${s({ w: 2.2 })}/>
    <path d="M78 118c8-10 36-10 44 0" fill="none" stroke="#3f7a78" stroke-width="4" stroke-linecap="round"/>
    ${hi(78, 76, 4, 14, 4)}`,
  akkawi: `
    <path d="M30 128l24-40h110l-20 40z" fill="#fbf6e6" ${s()}/>
    <path d="M30 128h114v34H30z" fill="#efe6cc" ${s()}/><path d="M144 128l20-40v34l-20 40z" fill="#e3d7b6" ${s()}/>
    <path d="M60 128l22-40M96 128l20-40" stroke="${INK}" stroke-width="2" opacity=".5"/>
    ${[[56, 108], [92, 104], [126, 108], [78, 144], [118, 146]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.6" fill="#e0d3ae"/>`).join('')}
    ${leaf('M150 176c10-12 24-14 34-6-10 10-24 12-34 6z', '#6f9a3c')}`,
  loomi: `
    ${[[66, 132, 30], [118, 138, 32], [94, 96, 28], [146, 104, 24]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${['#6b4a2a', '#7a5530', '#5a3c22', '#8a6236'][i]}" ${s()}/><path d="M${x - r * 0.2} ${y - r * 0.9}c${r * 0.3} ${r * 0.5} ${r * 0.1} ${r} ${r * 0.5} ${r * 1.5}" stroke="#2e1d10" stroke-width="1.4" fill="none" opacity=".4"/><path d="M${x - r * 0.95} ${y + r * 0.35}l${r * 0.3} -${r * 0.14} ${r * 0.28} ${r * 0.18} ${r * 0.34} -${r * 0.2} ${r * 0.3} ${r * 0.1}" stroke="#2e1d10" stroke-width="1.4" fill="none" opacity=".55"/>${hi(x - r / 3, y - r / 3, r / 5, r / 9)}`).join('')}`,
  regag: `
    <ellipse cx="100" cy="146" rx="80" ry="30" fill="#e7c98f" ${s()}/>
    <path d="M28 138c20-60 124-70 146-4-30-14-110-14-146 4z" fill="#efd6a2" ${s()}/>
    ${[[62, 120], [92, 108], [124, 112], [148, 126], [80, 150], [118, 156], [150, 150]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="3.4" fill="#b98a52" opacity=".65"/>`).join('')}`,
  'date-syrup': `
    <path d="M64 60h72v18c12 6 18 18 18 34v56c0 8-6 14-14 14H60c-8 0-14-6-14-14v-56c0-16 6-28 18-34z" fill="#4a2616" ${s()}/>
    <rect x="58" y="42" width="84" height="20" rx="4" fill="#a7773f" ${s()}/>
    <path d="M60 62c8 8 16-4 24 4s16-4 24 2 18-6 26 0" fill="#6b3a1e" ${s({ w: 2.2 })}/>
    <path d="M70 110h60v34H70z" fill="#f3e6c6" ${s({ w: 2.2 })}/>
    ${oval(100, 127, 7, 11, 0, '#8a4a22', 1.8)}
    ${hi(62, 100, 4, 16, 8)}`,
}
