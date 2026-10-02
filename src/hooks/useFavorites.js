import { useEffect, useMemo, useState } from 'react'
import { onValue, ref, remove, set } from 'firebase/database'
import { db } from '../firebase'
import { DEFAULT_CATEGORY } from '../categories'

const keyOf = (name) => name.trim().toLowerCase()
// Chave segura para o Firebase (não aceita . # $ [ ] /)
const pathKey = (name) => encodeURIComponent(keyOf(name)).replace(/\./g, '%2E')

// "Itens fixos": produtos que sempre voltam (arroz, leite...). Guardados em users/<user>/favorites/<nome>
export function useFavorites(user) {
  const [favorites, setFavorites] = useState([])
  const base = `users/${user}/favorites`

  useEffect(() => {
    setFavorites([])
    return onValue(ref(db, base), (snap) => {
      const data = snap.val() ?? {}
      setFavorites(Object.values(data).sort((a, b) => a.name.localeCompare(b.name)))
    })
  }, [base])

  const favoriteKeys = useMemo(() => new Set(favorites.map((f) => keyOf(f.name))), [favorites])
  const isFavorite = (name) => favoriteKeys.has(keyOf(name))

  const toggleFavorite = ({ name, category }) => {
    const r = ref(db, `${base}/${pathKey(name)}`)
    return isFavorite(name) ? remove(r) : set(r, { name: name.trim(), category: category ?? DEFAULT_CATEGORY })
  }

  return { favorites, isFavorite, toggleFavorite }
}
