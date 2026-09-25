// Direction-safety tests for the archive wheel (the old "only scrolls one way" bug).
import { normalizeWheel, archiveStep } from '../src/hooks/wheelMath.js'
import assert from 'assert'
const cases = [[0, 40], [0, -40], [30, 0], [-30, 0], [12.5, -80], [-140, 140]]
for (const [dx, dy] of cases) {
  const a = archiveStep(dx, dy), b = archiveStep(-dx, -dy)
  assert.ok(Math.abs(a.x + b.x) < 1e-9 && Math.abs(a.y + b.y) < 1e-9, 'opposite gestures must cancel')
}
assert.ok(archiveStep(0, 50).y < 0 && archiveStep(0, -50).y > 0, 'vertical sign preserved')
assert.ok(archiveStep(50, 0).x < 0 && archiveStep(-50, 0).x > 0, 'horizontal sign preserved')
const n = normalizeWheel({ deltaX: 0, deltaY: -3, deltaMode: 1 })
assert.strictEqual(n.dy, -48, 'line mode keeps sign')
assert.strictEqual(normalizeWheel({ deltaX: 0, deltaY: -900, deltaMode: 0 }).dy, -140, 'clamp keeps sign')
// sum of a scroll down then the same scroll up returns to start
let y = 0; for (let i = 0; i < 20; i++) y += archiveStep(0, 37).y; for (let i = 0; i < 20; i++) y += archiveStep(0, -37).y
assert.ok(Math.abs(y) < 1e-9, 'round trip returns to origin')
console.log('wheel tests passed')
