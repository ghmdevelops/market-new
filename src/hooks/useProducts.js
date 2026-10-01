import { useEffect, useState } from 'react'
import { onValue, push, ref, remove, update } from 'firebase/database'
import { db } from '../firebase'
import { DEFAULT_CATEGORY, categoryOrder } from '../categories'

// Lista "mestre" de produtos que você quer comprar (persistida em /products)
export function useProducts() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    // onValue retorna a função de unsubscribe, que o React chama ao desmontar
    return onValue(ref(db, 'products'), (snap) => {
      const data = snap.val() ?? {}
      const list = Object.entries(data)
        .map(([id, p]) => ({ id, category: DEFAULT_CATEGORY, ...p }))
        .sort((a, b) => categoryOrder(a.category) - categoryOrder(b.category) || a.name.localeCompare(b.name))
      setProducts(list)
    })
  }, [])

  const addProduct = (name, category = DEFAULT_CATEGORY) => {
    const trimmed = name.trim()
    if (!trimmed) return
    return push(ref(db, 'products'), { name: trimmed, category, createdAt: Date.now() })
  }

  // Adiciona vários de uma vez, ignorando os que já existem (por nome, sem diferenciar maiúsculas)
  const addProducts = (items) => {
    const existing = new Set(products.map((p) => p.name.toLowerCase()))
    const updates = {}
    for (const { name, category } of items) {
      const key = name.trim().toLowerCase()
      if (!key || existing.has(key)) continue
      existing.add(key)
      const id = push(ref(db, 'products')).key
      updates[id] = { name: name.trim(), category: category ?? DEFAULT_CATEGORY, createdAt: Date.now() }
    }
    return Object.keys(updates).length ? update(ref(db, 'products'), updates) : Promise.resolve()
  }

  const removeProduct = (id) => remove(ref(db, `products/${id}`))

  const removeProducts = (ids) =>
    update(ref(db, 'products'), Object.fromEntries(ids.map((id) => [id, null])))

  return { products, addProduct, addProducts, removeProduct, removeProducts }
}
