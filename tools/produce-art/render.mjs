import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs'
import { IDS, svgFor } from './art.mjs'
import { writeFileSync, mkdirSync } from 'fs'
mkdirSync('png', { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 400, height: 420 } })
for (const id of IDS) {
  await page.setContent(`<html><body style="margin:0;background:transparent">${svgFor(id)}</body></html>`)
  const buf = await page.locator('svg').screenshot({ omitBackground: true })
  writeFileSync(`png/${id}.png`, buf)
}
await browser.close()
console.log('rendered', IDS.length)
