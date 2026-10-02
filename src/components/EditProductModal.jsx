import { useState } from 'react'
import { CATEGORIES } from '../categories'
import { ui } from '../ui'

export function EditProductModal({ product, favorite, onSave, onToggleFavorite, onClose }) {
  const [name, setName] = useState(product.name)
  const [category, setCategory] = useState(product.category)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name, category })
  }

  const label = 'mt-3 block text-sm font-medium text-slate-600 dark:text-slate-300'

  return (
    <div className={ui.modalBackdrop} onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className={ui.modal}>
        <h2 className="text-xl font-semibold">Editar produto</h2>
        <p className={`text-xs ${ui.faint}`}>O histórico de preços é mantido.</p>

        <label className={label}>
          Nome
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus className={`${ui.input} mt-1 w-full text-lg`} />
        </label>

        <label className={label}>
          Categoria
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${ui.select} mt-1 w-full py-2.5 text-base`}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>

        <button
          type="button"
          onClick={onToggleFavorite}
          className={`mt-4 flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm ${
            favorite
              ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40'
              : 'border-slate-200 dark:border-slate-700'
          }`}
        >
          <span className={`text-xl ${favorite ? 'text-amber-500' : ui.faint}`}>{favorite ? '★' : '☆'}</span>
          <span className="flex-1">
            <strong>Item fixo</strong>
            <span className={`block text-xs ${ui.muted}`}>Sempre volta — pode ser adicionado de uma vez ao começar a compra.</span>
          </span>
        </button>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className={`${ui.btnGhost} flex-1`}>Cancelar</button>
          <button type="submit" className={`${ui.btnPrimary} flex-1`}>Salvar</button>
        </div>
      </form>
    </div>
  )
}
