import { useEffect, useMemo, useState } from 'react'
import { onValue, push, ref, remove, update } from 'firebase/database'
import { db } from '../firebase'

/*
  Estrutura no Realtime Database:
  users/{user}/purchases/{id}: {
    startedAt: number,
    finishedAt: number | null,   // null = compra em andamento
    market: string | null,
    budget: number | null,       // orçamento planejado (opcional)
    items: { [productId]: { name, category, price, qty, checked, checkedAt } }
  }
*/
export function usePurchases(user) {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const base = `users/${user}/purchases`

  useEffect(() => {
    setPurchases([])
    setLoading(true)
    return onValue(ref(db, base), (snap) => {
      const data = snap.val() ?? {}
      const list = Object.entries(data)
        .map(([id, p]) => ({ id, items: {}, finishedAt: null, ...p }))
        .sort((a, b) => b.startedAt - a.startedAt)
      setPurchases(list)
      setLoading(false)
    })
  }, [base])

  const current = useMemo(() => purchases.find((p) => p.finishedAt === null) ?? null, [purchases])
  const history = useMemo(() => purchases.filter((p) => p.finishedAt !== null), [purchases])

  const startPurchase = (market, budget) =>
    push(ref(db, base), {
      startedAt: Date.now(),
      finishedAt: null,
      market: market?.trim() || null,
      budget: Number.isFinite(budget) && budget > 0 ? budget : null,
    })

  // Estatísticas de preço por produto a partir das compras finalizadas: { [productId]: { avg, last, min, max, count } }
  const priceStats = useMemo(() => {
    const acc = {}
    for (const p of [...history].reverse()) {
      for (const [id, item] of Object.entries(p.items)) {
        if (!item.checked) continue
        const s = (acc[id] ??= { sum: 0, count: 0, min: Infinity, max: -Infinity, last: null })
        s.sum += item.price
        s.count += 1
        s.min = Math.min(s.min, item.price)
        s.max = Math.max(s.max, item.price)
        s.last = item.price
      }
    }
    return Object.fromEntries(
      Object.entries(acc).map(([id, s]) => [id, { avg: s.sum / s.count, last: s.last, min: s.min, max: s.max, count: s.count }]),
    )
  }, [history])

  const setItem = (purchaseId, productId, item) =>
    update(ref(db, `${base}/${purchaseId}/items`), { [productId]: item })

  const uncheckItem = (purchaseId, productId) =>
    remove(ref(db, `${base}/${purchaseId}/items/${productId}`))

  const finishPurchase = (purchaseId) =>
    update(ref(db, `${base}/${purchaseId}`), { finishedAt: Date.now() })

  const deletePurchase = (purchaseId) => remove(ref(db, `${base}/${purchaseId}`))

  return { current, history, loading, priceStats, startPurchase, setItem, uncheckItem, finishPurchase, deletePurchase }
}
