import { useEffect, useState } from 'react'
import { onValue, push, ref, remove, set, update } from 'firebase/database'
import { db } from '../firebase'
import { DEFAULT_CATEGORY, categoryOrder } from '../categories'

// Lista "mestre" de produtos que você quer comprar (persistida em users/<user>/products)
export function useProducts(user) {
  const [products, setProducts] = useState([])
  const base = `users/${user}/products`

  useEffect(() => {
    setProducts([])
    // onValue retorna a função de unsubscribe, que o React chama ao desmontar
    return onValue(ref(db, base), (snap) => {
      const data = snap.val() ?? {}
      const list = Object.entries(data)
        .map(([id, p]) => ({ id, category: DEFAULT_CATEGORY, ...p }))
        .sort((a, b) => categoryOrder(a.category) - categoryOrder(b.category) || a.name.localeCompare(b.name))
      setProducts(list)
    })
  }, [base])

  const addProduct = (name, category = DEFAULT_CATEGORY) => {
    const trimmed = name.trim()
    if (!trimmed) return
    return push(ref(db, base), { name: trimmed, category, createdAt: Date.now() })
  }

  // Adiciona vários de uma vez, ignorando os que já existem (por nome, sem diferenciar maiúsculas).
  // Retorna { added, skipped } para a UI informar o resultado.
  const addProducts = async (items) => {
    const existing = new Set(products.map((p) => p.name.toLowerCase()))
    const updates = {}
    let skipped = 0
    for (const { name, category } of items) {
      const key = name.trim().toLowerCase()
      if (!key) continue
      if (existing.has(key)) { skipped++; continue }
      existing.add(key)
      const id = push(ref(db, base)).key
      updates[id] = { name: name.trim(), category: category ?? DEFAULT_CATEGORY, createdAt: Date.now() }
    }
    const added = Object.keys(updates).length
    if (added) await update(ref(db, base), updates)
    return { added, skipped }
  }

  // Edita nome/categoria mantendo o id (e, portanto, o histórico de preço)
  const updateProduct = (id, { name, category }) => {
    const trimmed = name?.trim()
    if (!trimmed) return Promise.resolve()
    return update(ref(db, `${base}/${id}`), { name: trimmed, category: category ?? DEFAULT_CATEGORY })
  }

  const removeProduct = (id) => remove(ref(db, `${base}/${id}`))

  // Recoloca um produto removido com o mesmo id (usado pelo "Desfazer")
  const restoreProduct = ({ id, ...data }) => set(ref(db, `${base}/${id}`), data)

  const removeProducts = (ids) =>
    update(ref(db, base), Object.fromEntries(ids.map((id) => [id, null])))

  return { products, addProduct, addProducts, updateProduct, removeProduct, restoreProduct, removeProducts }
}
