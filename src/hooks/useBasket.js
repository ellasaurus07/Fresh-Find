import { useCallback, useMemo, useState } from 'react'
import { marketById, produceById } from '../lib/data.js'
import { orderMetaFor } from '../lib/produceExtras.js'

const KEY = 'freshfind-demo-basket-v1'

function readInitial() {
  try {
    const raw = sessionStorage.getItem(KEY)
    const items = raw ? JSON.parse(raw) : []
    return Array.isArray(items) ? items.filter((x) => x?.produceId && x?.marketId && x?.qty > 0) : []
  } catch {
    return []
  }
}

export default function useBasket() {
  const [items, setItems] = useState(readInitial)

  const write = (next) => {
    try { sessionStorage.setItem(KEY, JSON.stringify(next)) } catch { /* session-only fallback */ }
    return next
  }

  const add = useCallback((produceId, marketId, qty = 1) => {
    if (!produceById[produceId] || !marketById[marketId]) return
    const n = Math.max(1, Math.min(99, Number(qty) || 1))
    setItems((prev) => {
      const found = prev.find((x) => x.produceId === produceId && x.marketId === marketId)
      return write(found
        ? prev.map((x) => x.produceId === produceId && x.marketId === marketId ? { ...x, qty: Math.min(99, x.qty + n) } : x)
        : [...prev, { produceId, marketId, qty: n }])
    })
  }, [])

  const setQty = useCallback((produceId, marketId, qty) => {
    const n = Math.max(0, Math.min(99, Number(qty) || 0))
    setItems((prev) => write(n === 0
      ? prev.filter((x) => !(x.produceId === produceId && x.marketId === marketId))
      : prev.map((x) => x.produceId === produceId && x.marketId === marketId ? { ...x, qty: n } : x)))
  }, [])

  const remove = useCallback((produceId, marketId) => setQty(produceId, marketId, 0), [setQty])
  const clear = useCallback(() => setItems(() => write([])), [])

  const detailed = useMemo(() => items.map((item) => {
    const produce = produceById[item.produceId]
    const market = marketById[item.marketId]
    if (!produce || !market) return null
    const meta = orderMetaFor(produce)
    return { ...item, produce, market, meta, lineTotal: meta.price * item.qty }
  }).filter(Boolean), [items])

  const count = useMemo(() => items.reduce((sum, x) => sum + x.qty, 0), [items])
  const subtotal = useMemo(() => detailed.reduce((sum, x) => sum + x.lineTotal, 0), [detailed])

  return { items, detailed, count, subtotal, add, setQty, remove, clear }
}
