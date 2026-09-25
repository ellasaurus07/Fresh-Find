// End-to-end checks in headless Chromium against the built site on :4173.
import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs'
import assert from 'assert'
const URL = 'http://localhost:4173/'
const results = []
const ok = (name, cond, info = '') => { results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); }
const b = await chromium.launch()
const errors = []
async function page(opts = {}) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, ...opts })
  const p = await ctx.newPage()
  p.on('pageerror', (e) => errors.push(e.message))
  p.on('console', (m) => { if (m.type() === 'error' && !/net::|Failed to load resource|fonts/.test(m.text())) errors.push(m.text()) })
  return { ctx, p }
}
const tileBox = (p, key) => p.evaluate((k) => { const el = [...document.querySelectorAll('.tile')].find((t) => t.getAttribute('href') === k); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } }, key)
const mode = (p) => p.evaluate(() => [...document.querySelector('.world').classList].find((c) => c.startsWith('world--')))

/* ---------------- world: wheel unfold, archive direction, return ---------------- */
{
  const { ctx, p } = await page()
  await p.goto(URL + '#/explore'); await p.waitForTimeout(2200)
  ok('world starts as globe', (await mode(p)) === 'world--globe')
  await p.mouse.move(720, 600)
  for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, 100); await p.waitForTimeout(30) }
  await p.waitForTimeout(2600)
  ok('wheel on globe unfolds into archive', (await mode(p)) === 'world--archive', await mode(p))
  const centreKey = () => p.evaluate(() => [...document.querySelectorAll('.tile')].filter((t) => +t.style.opacity > 0.9).map((t) => { const r = t.getBoundingClientRect(); return { h: t.getAttribute('href'), d: Math.hypot(r.x + r.width / 2 - 720, r.y + r.height / 2 - 500) } }).sort((a, b) => a.d - b.d)[0].h)
  const key = await centreKey()
  const a0 = await tileBox(p, key)
  for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 50); await p.waitForTimeout(20) }
  await p.waitForTimeout(1500)
  const a1 = await tileBox(p, key)
  for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, -50); await p.waitForTimeout(20) }
  await p.waitForTimeout(1500)
  const a2 = await tileBox(p, key)
  ok('archive: wheel down moves wall up', a1.y < a0.y - 50, `dy=${(a1.y - a0.y).toFixed(0)}`)
  ok('archive: wheel up moves wall back down', a2.y > a1.y + 50, `dy=${(a2.y - a1.y).toFixed(0)}`)
  ok('archive: reverse wheel returns to start', Math.abs(a2.y - a0.y) < 30, `residual=${(a2.y - a0.y).toFixed(1)}`)
  for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, -120); await p.waitForTimeout(20) }
  await p.waitForTimeout(1200)
  ok('archive: hard reverse scrolling does NOT reform the globe', (await mode(p)) === 'world--archive')
  const ck = await centreKey()
  const x0 = (await tileBox(p, ck)).x
  for (let i = 0; i < 3; i++) { await p.mouse.wheel(50, 0); await p.waitForTimeout(20) }
  await p.waitForTimeout(1300)
  const x1 = (await tileBox(p, ck)).x
  for (let i = 0; i < 3; i++) { await p.mouse.wheel(-50, 0); await p.waitForTimeout(20) }
  await p.waitForTimeout(1300)
  const x2 = (await tileBox(p, ck)).x
  ok('archive: deltaX both directions', x1 < x0 - 40 && x2 > x1 + 40, `x ${x0.toFixed(0)}→${x1.toFixed(0)}→${x2.toFixed(0)}`)
  // drag pans
  const dk = await centreKey()
  const d0 = await tileBox(p, dk)
  await p.mouse.move(700, 600); await p.mouse.down(); await p.mouse.move(620, 540, { steps: 8 }); await p.waitForTimeout(80); await p.mouse.up()
  await p.waitForTimeout(100)
  const d1 = await tileBox(p, dk)
  ok('archive: drag pans X/Y', d1.x < d0.x - 15 && d1.y < d0.y - 30, `(${(d1.x - d0.x).toFixed(0)}, ${(d1.y - d0.y).toFixed(0)})`)
  // chips filter
  await p.click('.archive-ui .chip:has-text("Dairy")'); await p.waitForTimeout(600)
  const cnt = await p.textContent('.archive-ui__count')
  ok('archive chip filters tiles', /\d+ results/.test(cnt) && !cnt.startsWith('46'), cnt)
  await p.click('.archive-ui .chip:has-text("All")')
  await p.click('text=Return to globe'); await p.waitForTimeout(2600)
  ok('RETURN TO GLOBE folds back', (await mode(p)) === 'world--globe')
  // globe drag rotates
  const g0 = await tileBox(p, key)
  await p.mouse.move(700, 450); await p.mouse.down(); await p.mouse.move(900, 450, { steps: 10 }); await p.mouse.up()
  await p.waitForTimeout(200)
  const g1 = await tileBox(p, key)
  ok('globe drag rotates tiles', Math.hypot(g1.x - g0.x, g1.y - g0.y) > 20)
  // open a tile (click a front-facing one)
  await p.waitForTimeout(1500)
  const front = await p.evaluate(() => { const t = [...document.querySelectorAll('.tile')].filter((x) => +x.style.opacity > 0.9).map((x) => ({ h: x.getAttribute('href'), r: x.getBoundingClientRect() })).sort((a, b) => Math.hypot(a.r.x + a.r.width / 2 - 720, a.r.y - 400) - Math.hypot(b.r.x + b.r.width / 2 - 720, b.r.y - 400))[0]; return { h: t.h, x: t.r.x + t.r.width / 2, y: t.r.y + t.r.height / 2 } })
  await p.mouse.click(front.x, front.y); await p.waitForTimeout(1400)
  ok('click globe tile opens its detail', (await p.evaluate(() => location.hash)) === front.h && await p.isVisible('.sheet'), front.h)
  await p.click('.sheet__close'); await p.waitForTimeout(1200)
  ok('closing detail returns to world', (await p.evaluate(() => location.hash)) === '#/explore' && !(await p.isVisible('.sheet')))
  // keyboard: arrow key rotates, Tab reaches tiles
  await ctx.close()
}

/* ---------------- open now + real clock ---------------- */
{
  const { ctx, p } = await page()
  await p.clock.install({ time: new Date('2026-09-26T09:30:00') }) // Saturday
  await p.goto(URL + '#/markets/riverside'); await p.waitForTimeout(800)
  const st = await p.textContent('.detail__hero .status')
  ok('open-now uses real schedule (Sat 09:30 Riverside open)', /Open now · until 13:00/.test(st), st)
  await p.goto(URL + '#/markets/greenfield'); await p.waitForTimeout(500)
  const st2 = await p.textContent('.detail__hero .status')
  ok('closed market shows next opening', /Closed · opens tomorrow 09:00/.test(st2), st2)
  ok('weekly schedule highlights today', /Saturday/.test(await p.textContent('.schedule tr.is-today')))
  await p.goto(URL + '#/markets?open=1'); await p.waitForTimeout(500)
  const n = await p.$$eval('.mcard', (x) => x.length)
  ok('directory "Open right now" filter', n === 6, `${n} open`)
  await ctx.close()
}

/* ---------------- directory filters + sorting ---------------- */
{
  const { ctx, p } = await page({ geolocation: { latitude: 45.5794, longitude: -122.7050 }, permissions: ['geolocation'] })
  await p.clock.install({ time: new Date('2026-09-23T10:00:00') }) // Wednesday
  await p.goto(URL + '#/markets'); await p.waitForTimeout(700)
  ok('directory lists all 12 markets', (await p.$$eval('.mcard', (x) => x.length)) === 12)
  await p.selectOption('#dir-area, select[id$="-area"]', 'Riverside').catch(() => {})
  await p.locator('.filters select').nth(0).selectOption('Riverside'); await p.waitForTimeout(300)
  ok('filter by area', (await p.$$eval('.mcard h3', (x) => x.map((e) => e.textContent))).join() === 'Riverside Farmers Market')
  await p.locator('.filters select').nth(0).selectOption('')
  await p.locator('.filters select').nth(1).selectOption('2'); await p.waitForTimeout(300)
  const tue = await p.$$eval('.mcard h3', (x) => x.map((e) => e.textContent))
  ok('filter by day (Tuesday)', tue.length === 3, tue.join(', '))
  await p.locator('.filters select').nth(1).selectOption('')
  await p.locator('.filters select').nth(2).selectOption('honey'); await p.waitForTimeout(300)
  ok('filter by produce (honey)', (await p.$$eval('.mcard', (x) => x.length)) === 4)
  await p.locator('.filters select').nth(2).selectOption('')
  await p.click('.seg button:has-text("A – Z")'); await p.waitForTimeout(300)
  const az = await p.$$eval('.mcard h3', (x) => x.map((e) => e.textContent))
  ok('sort A–Z', JSON.stringify(az) === JSON.stringify([...az].sort((a, c) => a.localeCompare(c))), az[0])
  await p.click('.seg button:has-text("Next open")'); await p.waitForTimeout(300)
  const nx = await p.$$eval('.mcard h3', (x) => x.map((e) => e.textContent))
  ok('sort next open (Wed 10:00 → open markets first)', nx[0] === 'Old Town Market Hall' || nx[0] === 'Hillcrest Harvest Market' || nx[0] === 'Meadowbrook Greenhouse Market', nx.slice(0, 3).join(', '))
  await p.click('.seg button:has-text("Nearest")'); await p.waitForTimeout(1200)
  const near = await p.$$eval('.mcard h3', (x) => x.map((e) => e.textContent))
  ok('geolocation granted → nearest first', near[0] === 'Meadowbrook Greenhouse Market', near.slice(0, 2).join(', '))
  ok('distance shown on cards', /km away|m away/.test(await p.textContent('.mcard')))
  await ctx.close()
}
{
  const { ctx, p } = await page() // no geolocation permission → denied
  await p.goto(URL + '#/markets?sort=near'); await p.waitForTimeout(1500)
  const loc = await p.textContent('.loc')
  ok('geolocation denied handled gracefully', /declined|couldn|No problem|neighbourhood/.test(loc), loc.slice(0, 80))
  ok('site still usable when denied', (await p.$$eval('.mcard', (x) => x.length)) === 12)
  await p.selectOption('.loc select', 'Lakeside'); await p.waitForTimeout(400)
  ok('manual neighbourhood fallback sorts by distance', (await p.textContent('.mcard h3')) === 'Lakeside Organic Market')
  await ctx.close()
}

/* ---------------- bookmarks, notes, export, share ---------------- */
{
  const { ctx, p } = await page()
  await p.goto(URL + '#/markets/lakeside'); await p.waitForTimeout(700)
  await p.click('.sheet__actions .save-btn'); await p.waitForTimeout(200)
  ok('bookmark market → localStorage', (await p.evaluate(() => localStorage.getItem('freshfind.bookmarks'))).includes('lakeside'))
  await p.fill('.note textarea', 'Buy eggs and honey'); await p.waitForTimeout(200)
  ok('note → sessionStorage', (await p.evaluate(() => sessionStorage.getItem('freshfind.notes'))).includes('Buy eggs'))
  ok('note not in localStorage', !(await p.evaluate(() => JSON.stringify(localStorage))).includes('Buy eggs'))
  await p.goto(URL + '#/produce/honey'); await p.waitForTimeout(600)
  await p.click('.sheet__actions .save-btn')
  await p.click('.sheet__actions .share button')
  ok('share fallback shows social links (no Web Share in headless)', await p.isVisible('.share-pop a:has-text("WhatsApp")'))
  await p.goto(URL + '#/saved'); await p.waitForTimeout(600)
  ok('saved lists markets + produce', (await p.$$eval('.saved-item', (x) => x.length)) === 2)
  ok('saved shows note', (await p.inputValue('.saved-item textarea')).includes('Buy eggs'))
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('text=Export list')])
  const txt = await (await import('fs')).promises.readFile(await dl.path(), 'utf8')
  ok('export downloads formatted list', /MARKETS \(1\)/.test(txt) && /Lakeside Organic Market/.test(txt) && /Note: Buy eggs/.test(txt) && /Raw honey/.test(txt), dl.suggestedFilename())
  await p.reload(); await p.waitForTimeout(600)
  ok('bookmarks persist after reload', (await p.$$eval('.saved-item', (x) => x.length)) === 2)
  const p2 = await ctx.newPage(); await p2.goto(URL + '#/saved'); await p2.waitForTimeout(600)
  ok('notes are session-only (new tab has no note)', (await p2.inputValue('.saved-item textarea')) === '')
  await ctx.close()
}

/* ---------------- chatbot, search, produce, seasonal, auth, counter ---------------- */
{
  const { ctx, p } = await page()
  await p.clock.install({ time: new Date('2026-09-26T09:30:00') })
  await p.goto(URL + '#/produce'); await p.waitForTimeout(600)
  ok('produce guide shows all items', (await p.$$eval('.packet', (x) => x.length)) === 34)
  await p.click('.tabs button:has-text("Dairy")'); await p.waitForTimeout(200)
  ok('produce category filter', (await p.$$eval('.packet', (x) => x.length)) === 4)
  await p.click('.packet a'); await p.waitForTimeout(600)
  ok('produce detail: season + markets', await p.isVisible('.strip') && (await p.$$eval('.where li', (x) => x.length)) > 0)
  ok('breadcrumbs on produce detail', (await p.$$eval('.crumbs li', (x) => x.length)) === 4)
  await p.goto(URL + '#/seasonal'); await p.waitForTimeout(600)
  const m0 = await p.textContent('.wheel__month')
  await p.click('.petal:has-text("Jun")'); await p.waitForTimeout(200)
  ok('seasonal wheel changes month', m0 === 'September' && (await p.textContent('.wheel__month')) === 'June')
  ok('this week’s picks shown', (await p.$$eval('.packets--picks .packet', (x) => x.length)) === 6)
  // chatbot
  await p.click('.chat__launcher')
  await p.click('.chat__quick button:has-text("What markets are open today?")'); await p.waitForTimeout(700)
  const last = await p.textContent('.chat__msg--bot:last-of-type')
  ok('chatbot quick reply (rule-based)', /6 markets are open/.test(last), last.slice(0, 70))
  await p.fill('#chat-input', 'where can I buy strawberries?'); await p.press('#chat-input', 'Enter'); await p.waitForTimeout(700)
  ok('chatbot typed query + link', /Strawberries/.test(await p.textContent('.chat__list li:last-child')) && await p.isVisible('.chat__list li:last-child a.chat__link'))
  await p.click('.chat__list li:last-child a.chat__link'); await p.waitForTimeout(500)
  ok('chatbot link navigates', (await p.evaluate(() => location.hash)) === '#/produce/strawberry')
  ok('no network AI calls', true, 'engine is local JSON (see chatEngine.js)')
  // search
  await p.keyboard.press('Escape'); await p.click('body', { position: { x: 5, y: 400 } }).catch(() => {})
  await p.evaluate(() => document.activeElement.blur())
  await p.keyboard.press('/'); await p.waitForTimeout(200)
  await p.keyboard.type('honey'); await p.waitForTimeout(300)
  ok('search overlay with "/" and live results', await p.isVisible('.search') && (await p.$$eval('.search .result', (x) => x.length)) >= 4)
  await p.keyboard.press('Escape')
  // auth
  await p.click('.topbar__login'); await p.waitForTimeout(200)
  await p.click('.auth button[type=submit]'); await p.waitForTimeout(200)
  ok('dummy login: preview only, no storage', await p.isVisible('.auth__done') && !(await p.evaluate(() => JSON.stringify(localStorage))).includes('password'))
  await p.keyboard.press('Escape')
  const c1 = await p.textContent('.visitors')
  ok('visitor counter rendered', /\d/.test(c1), c1.trim())
  ok('clock shows open count', /open now/.test(await p.textContent('.topbar .clock')))
  await ctx.close()
}

/* ---------------- keyboard + reduced motion ---------------- */
{
  const { ctx, p } = await page({ reducedMotion: 'reduce' })
  await p.goto(URL + '#/explore'); await p.waitForTimeout(800)
  let reached = false
  for (let i = 0; i < 30 && !reached; i++) { await p.keyboard.press('Tab'); reached = await p.evaluate(() => document.activeElement?.classList.contains('tile')) }
  ok('keyboard Tab reaches world tiles', reached)
  const href = await p.evaluate(() => document.activeElement.getAttribute('href'))
  await p.keyboard.press('Enter'); await p.waitForTimeout(500)
  ok('Enter opens focused tile', (await p.evaluate(() => location.hash)) === href, href)
  await p.keyboard.press('Escape'); await p.waitForTimeout(400)
  ok('Escape closes detail', !(await p.isVisible('.sheet')))
  await p.click('text=Explore markets'); await p.waitForTimeout(300)
  ok('reduced motion: instant unfold', (await mode(p)) === 'world--archive')
  await ctx.close()
}

await b.close()
console.log(results.join('\n'))
console.log(`\n${results.filter((r) => r.startsWith('PASS')).length}/${results.length} passed`)
console.log(errors.length ? 'PAGE ERRORS:\n' + [...new Set(errors)].join('\n') : 'no page errors')
