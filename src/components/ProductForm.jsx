import { useState } from 'react'
import { CATEGORIES, DEFAULT_CATEGORY } from '../categories'
import { ui } from '../ui'

export function ProductForm({ onAdd }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(DEFAULT_CATEGORY)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name, category)
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_auto_auto]">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex.: Arroz 5kg"
        autoFocus
        className={`${ui.input} col-span-2 min-w-0 sm:col-span-1`}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)} className={ui.select}>
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>
      <button type="submit" className={ui.btnPrimary}>Adicionar</button>
    </form>
  )
}
