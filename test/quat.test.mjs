import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs'
import { readFileSync } from 'fs'
const src = readFileSync('src/lib/quat.js', 'utf8').replace(/export /g, '')
const b = await chromium.launch(); const p = await b.newPage()
const res = await p.evaluate((src) => {
  (0,eval)('(function(){'+src+';window.__q={quatFromYPR,matrix3d,slerp,rotateVec,quatMul}})()')
  const Q=window.__q
  const out=[]
  for (const [y,x,z] of [[0.5,0.3,0.2],[-2.1,0.9,-0.4],[3.0,-1.1,0.7]]) {
    const d=document.createElement('div'); document.body.appendChild(d)
    d.style.transform=`translate3d(10px,20px,30px) rotateY(${y}rad) rotateX(${x}rad) rotateZ(${z}rad) scale3d(1.5,1.5,1.5)`
    const a=new DOMMatrix(getComputedStyle(d).transform)
    d.style.transform=Q.matrix3d([10,20,30],Q.quatFromYPR(y,x,z),1.5)
    const m=new DOMMatrix(getComputedStyle(d).transform)
    const A=a.toFloat64Array(), M=m.toFloat64Array()
    out.push(Math.max(...A.map((v,i)=>Math.abs(v-M[i]))))
    // rotateVec check: local +z normal
    const n=Q.rotateVec(Q.quatFromYPR(y,x,z),[0.3,0.8,1]); const pt=new DOMMatrix(`rotateY(${y}rad) rotateX(${x}rad) rotateZ(${z}rad)`).transformPoint(new DOMPoint(0.3,0.8,1))
    out.push(Math.max(Math.abs(n[0]-pt.x),Math.abs(n[1]-pt.y),Math.abs(n[2]-pt.z)))
  }
  return out
}, src)
console.log('max abs errors', res.map(v=>v.toExponential(2)).join(' '))
await b.close()
if (res.some(v=>v>1e-3)) process.exit(1)
