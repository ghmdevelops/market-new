import { useState } from 'react'
import { formatBRL } from '../utils'
import { ui } from '../ui'

const parsePrice = (s) => Number(String(s).replace(',', '.'))

function PriceAlert({ price, stats }) {
  if (!stats) return <p className={`mt-1 text-sm ${ui.faint}`}>Primeira vez comprando este item.</p>

  const p = parsePrice(price)
  const base = (
    <p className={`mt-1 text-sm ${ui.muted}`}>
      Média {formatBRL(stats.avg)} · última {formatBRL(stats.last)} · {stats.count} compra{stats.count > 1 ? 's' : ''}
    </p>
  )
  if (!Number.isFinite(p) || p <= 0) return base

  const pct = ((p - stats.avg) / stats.avg) * 100
  let cls = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  let msg = 'Preço na média'
  if (pct >= 5) { cls = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'; msg = `${pct.toFixed(0)}% mais caro que a média` }
  else if (pct <= -5) { cls = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'; msg = `${Math.abs(pct).toFixed(0)}% mais barato que a média` }
  if (p < stats.min) msg += ' · menor preço já pago!'
  else if (p > stats.max) msg += ' · maior preço já pago'

  return (
    <>
      {base}
      <p className={`mt-2 rounded-lg px-3 py-1.5 text-sm font-medium ${cls}`}>{msg}</p>
    </>
  )
}

export function PriceModal({ product, initial, stats, onSave, onClose }) {
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : '')
  const [qty, setQty] = useState(String(initial?.qty ?? 1))

  const handleSubmit = (e) => {
    e.preventDefault()
    const p = parsePrice(price)
    const q = Number(qty)
    if (!Number.isFinite(p) || p < 0 || !Number.isFinite(q) || q <= 0) return
    onSave(p, q)
  }

  const inputClass = `${ui.input} mt-1 w-full text-lg`
  const label = 'mt-3 block text-sm font-medium text-slate-600 dark:text-slate-300'

  return (
    <div className={ui.modalBackdrop} onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className={ui.modal}>
        <h2 className="text-xl font-semibold">{product.name}</h2>
        <p className={`text-xs ${ui.faint}`}>{product.category}</p>
        <PriceAlert price={price} stats={stats} />

        <div className="grid grid-cols-[1fr_6rem] gap-3">
          <label className={label}>
            Preço (R$)
            <input
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0,00"
              autoFocus
              className={inputClass}
            />
          </label>
          <label className={label}>
            Qtd
            <input type="number" min={1} step={1} value={qty} onChange={(e) => setQty(e.target.value)} className={inputClass} />
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className={`${ui.btnGhost} flex-1`}>Cancelar</button>
          <button type="submit" className={`${ui.btnPrimary} flex-1`}>Salvar no carrinho</button>
        </div>
      </form>
    </div>
  )
}
