import { useState } from 'react'

const KEY = 'market:user'

// Apelido simples, sem cadastro: vira o "dono" dos dados em users/<apelido>/...
// Regras: 3–20 caracteres, só letras minúsculas, números, "_" e "-".
export const normalizeUser = (raw) =>
  String(raw ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')

export const isValidUser = (name) => /^[a-z0-9_-]{3,20}$/.test(name)

export function useUser() {
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem(KEY)
    return saved && isValidUser(saved) ? saved : null
  })

  const setUser = (raw) => {
    const name = normalizeUser(raw)
    if (!isValidUser(name)) return false
    localStorage.setItem(KEY, name)
    setUserState(name)
    return true
  }

  const logout = () => {
    localStorage.removeItem(KEY)
    setUserState(null)
  }

  return { user, setUser, logout }
}
