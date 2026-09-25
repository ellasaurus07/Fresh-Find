// FreshFind produce illustrations — hand-authored SVG, ink + wash style.
// Rendered once to /public/assets/produce/*.webp by render.mjs.
const INK = '#4a3421'
const s = (o = {}) => `stroke="${INK}" stroke-width="${o.w || 3}" stroke-linejoin="round" stroke-linecap="round"`
const hi = (cx, cy, rx, ry, r = -25) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".38" transform="rotate(${r} ${cx} ${cy})"/>`
const leaf = (d, fill = '#6f9a3c') => `<path d="${d}" fill="${fill}" ${s({ w: 2.5 })}/>`
const vein = (d) => `<path d="${d}" fill="none" stroke="#3f5e22" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`

export const ART = {
  tomato: `
    <path d="M100 58c-44 0-68 30-68 66 0 36 30 56 68 56s68-20 68-56c0-36-24-66-68-66z" fill="#d8432c" ${s()}/>
    <path d="M58 90c-8 14-10 34 0 50" fill="none" stroke="#a52d1c" stroke-width="3" opacity=".55"/>
    <path d="M142 92c8 14 8 32-2 46" fill="none" stroke="#a52d1c" stroke-width="3" opacity=".45"/>
    ${hi(72, 92, 16, 9)}
    <path d="M100 66l-10-18 8 6 2-16 4 16 10-8-8 18 22-4-20 12 16 8-22-2-2 14-4-14-18 6 14-12-20-6z" fill="#5f8f34" ${s({ w: 2.2 })}/>`,
  carrot: `
    <path d="M70 70c-6 6-8 16-2 24l74 86c6 6 12 2 10-6L110 72c-6-10-26-14-40-2z" fill="#e8812b" ${s()}/>
    <path d="M86 104l14-6M98 122l14-6M112 140l12-6M124 158l10-4" stroke="${INK}" stroke-width="2" opacity=".55"/>
    ${hi(84, 88, 7, 16, -40)}
    ${leaf('M86 70c-10-22-6-44 4-54 2 16 6 32 6 48z')}
    ${leaf('M92 66c4-24 18-40 32-44-6 18-14 32-24 46z', '#7aa743')}
    ${leaf('M80 72C64 58 46 54 32 58c12 10 28 16 46 18z', '#5f8f34')}`,
  strawberry: `
    <path d="M100 64c-40 0-62 20-60 44 2 30 34 66 60 74 26-8 58-44 60-74 2-24-20-44-60-44z" fill="#d63a3a" ${s()}/>
    ${[[72,96],[100,92],[128,96],[84,120],[116,120],[100,146],[70,124],[130,124],[92,168-6],[110,162]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="2.6" ry="4" fill="#f4d36b" stroke="${INK}" stroke-width="1"/>`).join('')}
    ${hi(74, 88, 14, 7)}
    <path d="M100 70l-22-8 14 16-24 4 22 6-10 14 20-12 0 14 8-14 18 10-10-16 24-2-24-8 12-14-20 8z" fill="#5f8f34" ${s({ w: 2.2 })}/>
    <path d="M100 60c0-10 4-18 10-22" fill="none" ${s({ w: 3 })}/>`,
  apple: `
    <path d="M100 66c-14-10-40-12-56 4-20 22-12 66 8 88 14 16 30 20 48 12 18 8 34 4 48-12 20-22 28-66 8-88-16-16-42-14-56-4z" fill="#c9372f" ${s()}/>
    <path d="M150 90c6 22 0 46-14 62" fill="none" stroke="#e9a13b" stroke-width="6" opacity=".45"/>
    ${hi(70, 92, 12, 20, 20)}
    <path d="M100 68c0-14 2-26 8-34" fill="none" ${s({ w: 4 })}/>
    ${leaf('M106 44c10-14 28-18 40-12-8 12-24 18-40 12z')}
    ${vein('M108 43c12-4 22-8 34-10')}`,
  peach: `
    <circle cx="100" cy="114" r="62" fill="#f2a060" ${s()}/>
    <path d="M60 80c30-18 76-18 98 30" fill="none" stroke="#e46a4a" stroke-width="16" opacity=".35" stroke-linecap="round"/>
    <path d="M100 56c-10 30-10 72 4 118" fill="none" stroke="${INK}" stroke-width="2.4" opacity=".6"/>
    ${hi(72, 100, 14, 22, 15)}
    ${leaf('M104 54c14-18 36-22 50-14-10 14-30 20-50 14z')}
    ${vein('M106 53c14-4 26-8 42-10')}`,
  blueberries: `
    ${[[70,120,30],[124,112,32],[98,152,30],[140,156,24],[62,160,22]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#4c5f9e" ${s()}/><circle cx="${x}" cy="${y}" r="${r}" fill="#9fb0d8" opacity=".25"/><path d="M${x-6} ${y-r+8}l6 6 6-6" fill="none" ${s({ w: 2 })}/>${hi(x-r/3, y-r/4, r/4, r/7)}`).join('')}
    ${leaf('M92 92c-6-24 8-44 30-50 0 22-10 40-30 50z')}
    ${vein('M94 90c8-14 16-28 26-44')}`,
  lemon: `
    <path d="M36 112c6-28 34-50 64-50s58 22 64 50c-6 28-34 50-64 50s-58-22-64-50z" fill="#f2cf3e" ${s()}/>
    <path d="M36 112l-8 2M164 112l8-2" ${s({ w: 4 })}/>
    <path d="M60 136c24 14 56 14 84-4" fill="none" stroke="#c99a1e" stroke-width="5" opacity=".4"/>
    ${hi(76, 94, 18, 7, -12)}
    ${leaf('M104 64c6-18 24-30 44-28-6 16-24 28-44 28z')}
    ${vein('M106 62c12-10 24-18 38-24')}`,
  fig: `
    <path d="M100 48c-6 20-30 34-44 58-18 32 2 72 44 72s62-40 44-72c-14-24-38-38-44-58z" fill="#7d4a78" ${s()}/>
    <path d="M70 122c-4 20 8 38 30 42" fill="none" stroke="#b77aa8" stroke-width="7" opacity=".45" stroke-linecap="round"/>
    ${hi(84, 100, 8, 20, 18)}
    <path d="M100 48c0-10 2-16 6-20" fill="none" ${s({ w: 4 })}/>
    <path d="M132 176c10 2 22-4 26-14l-40-8z" fill="#e6788a" opacity="0"/>`,
  watermelon: `
    <path d="M24 100a76 76 0 0 0 152 0z" fill="#3f7d3a" ${s()}/>
    <path d="M34 100a66 66 0 0 0 132 0z" fill="#e8f0c8"/>
    <path d="M40 100a60 60 0 0 0 120 0z" fill="#e6483e" ${s({ w: 2 })}/>
    ${[[70,118],[92,132],[112,130],[132,118],[100,150],[80,146],[122,146]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="3" ry="5" fill="#2e2217"/>`).join('')}
    <path d="M24 100h152" ${s({ w: 3 })}/>
    ${hi(66, 108, 12, 4, 0)}`,
  pear: `
    <path d="M100 44c-16 0-22 18-24 36-2 16-26 30-26 60 0 28 22 42 50 42s50-14 50-42c0-30-24-44-26-60-2-18-8-36-24-36z" fill="#b7c65a" ${s()}/>
    <path d="M60 150c14 18 50 22 76 6" fill="none" stroke="#d99a3a" stroke-width="8" opacity=".35" stroke-linecap="round"/>
    ${hi(82, 110, 9, 22, 12)}
    <path d="M100 46c0-10 4-18 10-22" fill="none" ${s({ w: 4 })}/>
    ${leaf('M108 30c12-12 30-12 40-4-10 10-26 12-40 4z')}`,
  'leafy-greens': `
    ${leaf('M100 180C60 170 40 120 58 66c18 20 36 60 42 114z', '#4f7f2e')}
    ${leaf('M100 180c40-10 60-60 42-114-18 20-36 60-42 114z', '#5f8f34')}
    ${leaf('M100 180c-20-40-20-100 0-150 20 50 20 110 0 150z', '#7aa743')}
    ${leaf('M100 182C74 176 44 150 30 112c30 6 56 30 70 70z', '#6b9a3a')}
    ${leaf('M100 182c26-6 56-32 70-70-30 6-56 30-70 70z', '#86b24e')}
    ${vein('M100 176V52M100 120l-14-14M100 140l14-16M100 100l12-14')}`,
  beetroot: `
    <path d="M100 76c-34 0-54 24-50 52 4 28 30 44 50 56 20-12 46-28 50-56 4-28-16-52-50-52z" fill="#8e2c4f" ${s()}/>
    <path d="M100 184c0 8-2 12-6 16" fill="none" ${s({ w: 2.4 })}/>
    <path d="M70 118c6 24 22 38 30 44" fill="none" stroke="#c25a7c" stroke-width="7" opacity=".45" stroke-linecap="round"/>
    ${hi(78, 104, 10, 16, 20)}
    ${leaf('M96 78C80 60 64 30 76 14c14 14 22 40 20 64z', '#5f8f34')}
    ${leaf('M104 78c16-18 32-48 20-64-14 14-22 40-20 64z', '#6f9a3c')}
    <path d="M96 78L80 20M104 78l18-58" stroke="#8e2c4f" stroke-width="3" fill="none"/>`,
  pumpkin: `
    <path d="M100 66c-26-4-52 4-66 26-14 24-8 56 12 70 18 14 36 12 54 10 18 2 36 4 54-10 20-14 26-46 12-70-14-22-40-30-66-26z" fill="#e7862f" ${s()}/>
    <path d="M100 68c-18 20-22 70 0 104M100 68c18 20 22 70 0 104M70 72c-22 20-24 64-4 94M130 72c22 20 24 64 4 94" fill="none" stroke="${INK}" stroke-width="2.4" opacity=".6"/>
    ${hi(60, 100, 8, 18, 18)}
    <path d="M100 70c-2-14 0-24 10-32l8 6c-8 6-10 14-8 26z" fill="#6c5a2b" ${s({ w: 2.4 })}/>
    ${leaf('M114 50c10-10 28-12 38-4-10 8-24 10-38 4z')}`,
  'sweet-corn': `
    ${leaf('M100 186C70 160 58 110 66 60c18 30 30 80 34 126z', '#6f9a3c')}
    <path d="M100 36c-16 0-24 30-24 70s8 72 24 72 24-32 24-72-8-70-24-70z" fill="#f1cd4a" ${s()}/>
    ${Array.from({length:8},(_,i)=>`<path d="M80 ${56+i*15}h40" stroke="#c99a1e" stroke-width="2" opacity=".7"/>`).join('')}
    <path d="M92 44v130M108 44v130" stroke="#c99a1e" stroke-width="2" opacity=".6"/>
    ${leaf('M100 186c30-26 42-76 34-126-18 30-30 80-34 126z', '#5f8f34')}
    ${hi(88, 80, 4, 20, 0)}`,
  eggplant: `
    <path d="M78 70c-26 16-40 56-30 86 8 24 38 32 60 18 26-16 40-48 46-86 2-14-8-26-24-26-18 0-34 0-52 8z" fill="#5a3470" ${s()}/>
    ${hi(70, 118, 8, 26, 20)}
    <path d="M130 62c-6-16-24-24-40-18 8 4 12 10 12 16 10-6 20-4 28 2z" fill="#5f8f34" ${s({ w: 2.4 })}/>
    <path d="M128 60c6-14 16-22 26-24" fill="none" ${s({ w: 4 })}/>`,
  'bell-pepper': `
    <path d="M58 76c-18 12-20 48-12 72 8 24 30 32 54 30 24 2 46-6 54-30 8-24 6-60-12-72-12-8-26-6-42-2-16-4-30-6-42 2z" fill="#e5412f" ${s()}/>
    <path d="M100 78c-8 30-8 70 0 100M76 84c-10 26-8 60 4 88M124 84c10 26 8 60-4 88" fill="none" stroke="#a52d1c" stroke-width="2.4" opacity=".6"/>
    ${hi(64, 110, 8, 22, 12)}
    <path d="M86 76c4-8 24-8 28 0-4 4-24 4-28 0z" fill="#5f8f34" ${s({ w: 2.4 })}/>
    <path d="M100 74c0-12 4-22 12-28" fill="none" stroke="#5f8f34" stroke-width="7" stroke-linecap="round"/><path d="M100 74c0-12 4-22 12-28" fill="none" ${s({ w: 2 })} opacity=".6"/>`,
  radish: `
    ${[[74,0],[124,1]].map(([x,k])=>`<path d="M${x} 104c-26 0-38 20-34 40 4 18 22 30 34 36 12-6 30-18 34-36 4-20-8-40-34-40z" fill="#d6405a" ${s()}/><path d="M${x-6} 164c4 8 8 12 14 16" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M${x} 180c0 8-2 12-4 16" fill="none" ${s({ w: 2 })}/>${hi(x-12, 124, 7, 11, 20)}${leaf(`M${x-4} 106C${x-20} 86 ${x-26} 58 ${x-16} 42c12 14 16 40 12 64z`, k ? '#6f9a3c' : '#5f8f34')}${leaf(`M${x+4} 106c14-20 26-42 18-60-14 12-20 36-18 60z`, '#7aa743')}`).join('')}`,
  cucumber: `
    <path d="M46 150c-10-8-6-22 6-30 34-24 70-54 96-78 10-8 24-4 26 8 2 10-4 18-12 26-26 26-62 56-96 76-8 4-14 4-20-2z" fill="#4e8a3a" ${s()}/>
    <path d="M60 134c30-22 62-48 90-74" fill="none" stroke="#a9cf7a" stroke-width="7" opacity=".5" stroke-linecap="round"/>
    ${[[70,122],[92,106],[114,90],[136,72],[82,140],[104,124],[126,106]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.8" fill="${INK}"/>`).join('')}
    <path d="M168 42c6-6 10-14 10-20" fill="none" ${s({ w: 3 })}/>`,
  cheese: `
    <path d="M28 128l108-58 40 36v52H28z" fill="#f3cf6b" ${s()}/>
    <path d="M28 128h148v30H28z" fill="#e7b64c" ${s()}/>
    <path d="M136 70l40 36H28" fill="none" ${s()}/>
    ${[[66,114,8],[112,98,6],[150,120,7],[60,144,6],[124,146,9]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*0.7}" fill="#c9923a" stroke="${INK}" stroke-width="1.6"/>`).join('')}
    ${hi(92, 90, 16, 4, -28)}`,
  milk: `
    <path d="M78 30h44v18c0 8 18 20 18 44v76c0 8-6 12-12 12H72c-6 0-12-4-12-12V92c0-24 18-36 18-44z" fill="#fbf8ef" ${s()}/>
    <path d="M60 110h80v58c0 8-6 12-12 12H72c-6 0-12-4-12-12z" fill="#dfe8ef" opacity=".7"/>
    <rect x="74" y="20" width="52" height="14" rx="4" fill="#5f8f34" ${s({ w: 2.4 })}/>
    <path d="M70 118h60v30H70z" fill="#f3e2b8" ${s({ w: 2.2 })}/>
    <path d="M86 128c6-6 22-6 28 0-6 8-22 8-28 0z" fill="#6f9a3c"/>
    ${hi(74, 80, 4, 18, 8)}`,
  eggs: `
    <path d="M24 150c0-10 8-16 18-16h116c10 0 18 6 18 16v12c0 10-8 18-18 18H42c-10 0-18-8-18-18z" fill="#c9a26a" ${s()}/>
    ${[[56,112],[100,104],[144,112]].map(([x,y],i)=>`<path d="M${x} ${y-40}c-20 0-30 24-30 42s12 30 30 30 30-12 30-30-10-42-30-42z" fill="${['#f4e3c6','#e9c8a0','#f7ecd8'][i]}" ${s()}/>${hi(x-10, y-16, 5, 10, 18)}`).join('')}
    <path d="M24 150h152" ${s({ w: 2.4 })}/>`,
  yogurt: `
    <path d="M50 70h100l-10 100c-1 8-6 12-14 12H74c-8 0-13-4-14-12z" fill="#f7f1e2" ${s()}/>
    <path d="M56 104h88l-4 34H60z" fill="#8c3b6b" opacity=".8"/>
    <path d="M46 60h108v14H46z" fill="#e5d9bd" ${s()}/>
    <path d="M70 60c4-18 16-26 30-26s26 8 30 26" fill="#f7f1e2" ${s()}/>
    ${[[80,46],[104,40],[122,50]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#6a4b9a" ${s({ w: 2 })}/>`).join('')}
    ${hi(64, 88, 3, 12, 6)}`,
  honey: `
    <path d="M64 56h72v20c14 6 22 20 22 40v50c0 10-8 16-18 16H60c-10 0-18-6-18-16v-50c0-20 8-34 22-40z" fill="#e3a52a" ${s()}/>
    <path d="M52 112c30-10 66-10 96 0v54c0 6-4 10-10 10H62c-6 0-10-4-10-10z" fill="#c9821c" opacity=".55"/>
    <rect x="58" y="40" width="84" height="20" rx="4" fill="#a7773f" ${s()}/>
    <path d="M58 60c10 8 20-6 30 4s22-6 32 2 18-6 22 0" fill="#f2e6c8" ${s({ w: 2.2 })}/>
    <path d="M76 116h48v28H76z" fill="#f3e6c6" ${s({ w: 2.2 })}/>
    <path d="M100 124l8 5v9l-8 5-8-5v-9z" fill="#e3a52a" ${s({ w: 1.6 })}/>
    ${hi(62, 96, 4, 14, 8)}`,
  sourdough: `
    <path d="M26 132c0-40 34-70 74-70s74 30 74 70c0 20-14 34-34 34H60c-20 0-34-14-34-34z" fill="#c68a45" ${s()}/>
    <path d="M40 150c30 10 90 10 120 0" fill="none" stroke="#8f5a26" stroke-width="7" opacity=".45" stroke-linecap="round"/>
    <path d="M58 98c14 6 24 20 26 38M92 84c14 8 22 24 22 42M126 90c12 8 18 22 16 38" fill="none" stroke="#f4dcae" stroke-width="7" stroke-linecap="round"/>
    <path d="M58 98c14 6 24 20 26 38M92 84c14 8 22 24 22 42M126 90c12 8 18 22 16 38" fill="none" ${s({ w: 2 })} opacity=".6"/>
    ${hi(64, 86, 16, 5, -26)}`,
  mushrooms: `
    ${[[70,110,34,0],[128,96,40,1],[104,146,24,2]].map(([x,y,r,i])=>`<path d="M${x-10} ${y}c0 20-4 34-6 ${54-i*10}h32c-2-${20-i*6}-6-34-6-54z" fill="#f2e6cc" ${s()}/><path d="M${x-r} ${y+4}c0-${r*0.9} ${r*0.5}-${r*1.1} ${r}-${r*1.1}s${r} ${r*0.2} ${r} ${r*1.1}c-${r*0.6} 8-${r*1.4} 8-${r*2} 0z" fill="${['#b07845','#9a653a','#c48a52'][i]}" ${s()}/>${hi(x-r/2, y-r/2+6, r/5, r/9, -20)}`).join('')}
    ${leaf('M30 186c20-12 40-12 60-2-18 10-40 12-60 2z', '#7aa743')}`,
}

export const IDS = Object.keys(ART)
export function svgFor(id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 210" width="400" height="420">
  <defs>
    <filter id="wash" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .12  0 0 0 .16 0" result="gt"/>
      <feComposite in="gt" in2="d" operator="in" result="grain"/>
      <feMerge><feMergeNode in="d"/><feMergeNode in="grain"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="100" cy="194" rx="66" ry="8" fill="#6b5433" opacity=".16"/>
  <g filter="url(#wash)">${ART[id]}</g>
</svg>`
}
