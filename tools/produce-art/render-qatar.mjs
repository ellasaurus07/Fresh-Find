import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs'
import { svgFor } from './art.mjs'
import { ART } from './art-qatar.mjs'
import { writeFileSync, mkdirSync } from 'fs'
mkdirSync('png', { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 400, height: 420 } })
for (const id of Object.keys(ART)) {
  // reuse the shared frame (wash filter + ground shadow) from art.js
  const svg = svgFor('tomato').replace(/<g filter="url\(#wash\)">[\s\S]*<\/g>/, `<g filter="url(#wash)">${ART[id]}</g>`)
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`)
  writeFileSync(`png/${id}.png`, await page.locator('svg').screenshot({ omitBackground: true }))
}
await browser.close()
console.log('rendered', Object.keys(ART).length)
