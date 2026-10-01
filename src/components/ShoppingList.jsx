import { useState } from 'react'
import { formatBRL, purchaseTotal } from '../utils'
import { ui } from '../ui'
import { PriceModal } from './PriceModal'
import { FinishModal } from './FinishModal'

const budgetTone = (pct) => {
  if (pct !== null && pct >= 100) return { bar: 'bg-red-600 dark:bg-red-700', fill: 'bg-red-300' }
  if (pct !== null && pct >= 80) return { bar: 'bg-amber-500 dark:bg-amber-600', fill: 'bg-amber-200' }
  return { bar: 'bg-emerald-600 dark:bg-emerald-700', fill: 'bg-emerald-300' }
}

function TotalBar({ current, checkedCount, total, totalProducts }) {
  const pct = current.budget ? (total / current.budget) * 100 : null
  const tone = budgetTone(pct)
  const remaining = current.budget ? current.budget - total : null

  return (
    <div className={`sticky top-2 z-10 overflow-hidden rounded-xl text-white shadow-lg transition-colors ${tone.bar}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 text-sm">
          <div className="truncate">{current.market ?? 'Compra em andamento'} · {checkedCount}/{totalProducts} no carrinho</div>
          {remaining !== null && (
            <div className="text-xs opacity-90">
              {remaining >= 0
                ? `Restam ${formatBRL(remaining)} de ${formatBRL(current.budget)}`
                : `${formatBRL(-remaining)} acima do orçamento de ${formatBRL(current.budget)}`}
            </div>
          )}
        </div>
        <strong className="shrink-0 text-xl tabular-nums">{formatBRL(total)}</strong>
      </div>
      {pct !== null && (
        <div className="h-1.5 w-full bg-black/20">
          <div className={`h-1.5 transition-all ${tone.fill}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      )}
    </div>
  )
}

function StartBar({ onStart, onRepeat, canRepeat }) {
  const [market, setMarket] = useState('')
  const [budget, setBudget] = useState('')

  return (
    <div className={`space-y-2 p-3 ${ui.card}`}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_11rem_auto]">
        <input value={market} onChange={(e) => setMarket(e.target.value)} placeholder="Mercado (opcional)" className={`${ui.input} min-w-0`} />
        <input
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          inputMode="decimal"
          placeholder="Orçamento R$"
          className={`${ui.input} min-w-0`}
        />
        <button onClick={() => onStart(market, Number(budget.replace(',', '.')))} className={`${ui.btnDark} col-span-2 sm:col-span-1`}>
          Começar compra
        </button>
      </div>
      {canRepeat && (
        <button onClick={onRepeat} className={`text-sm hover:underline ${ui.accent}`}>
          ↻ Repetir última compra (adicionar os itens dela à lista)
        </button>
      )}
    </div>
  )
}

export function ShoppingList({
  products, current, lastPurchase, priceStats,
  onRemoveProduct, onRemoveProducts, onStart, onRepeat, onSaveItem, onUncheck, onFinish,
}) {
  const [editing, setEditing] = useState(null)
  const [finishing, setFinishing] = useState(false)

  const total = current ? purchaseTotal(current) : 0
  const checkedCount = current ? Object.values(current.items).filter((i) => i.checked).length : 0
  const pending = current ? products.filter((p) => !current.items[p.id]?.checked) : []

  // Agrupa por categoria mantendo a ordem já vinda do hook (ordem do mercado)
  const groups = []
  for (const p of products) {
    const last = groups[groups.length - 1]
    if (last?.category === p.category) last.items.push(p)
    else groups.push({ category: p.category, items: [p] })
  }

  const handleConfirmFinish = (action) => {
    if (action === 'remove' && pending.length) onRemoveProducts(pending.map((p) => p.id))
    onFinish()
    setFinishing(false)
  }

  if (products.length === 0 && !lastPurchase) {
    return <p className={`mt-8 text-center ${ui.muted}`}>Nenhum produto ainda. Adicione acima o que você quer comprar.</p>
  }

  return (
    <section className="mt-4 space-y-4">
      {!current ? (
        <StartBar onStart={onStart} onRepeat={onRepeat} canRepeat={!!lastPurchase} />
      ) : (
        <TotalBar current={current} checkedCount={checkedCount} total={total} totalProducts={products.length} />
      )}

      {products.length === 0 && (
        <p className={`text-center ${ui.muted}`}>Lista vazia. Adicione produtos ou repita a última compra.</p>
      )}

      {groups.map((g) => {
        const groupTotal = current
          ? g.items.reduce((s, p) => { const i = current.items[p.id]; return i?.checked ? s + i.price * i.qty : s }, 0)
          : 0
        return (
          <div key={g.category}>
            <div className={`mb-1 flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wide ${ui.muted}`}>
              <span>{g.category}</span>
              {current && groupTotal > 0 && <span className="tabular-nums">{formatBRL(groupTotal)}</span>}
            </div>
            <ul className={`overflow-hidden ${ui.card} ${ui.divide}`}>
              {g.items.map((p) => {
                const item = current?.items[p.id]
                const checked = !!item?.checked
                return (
                  <li key={p.id} className={`flex items-center ${checked ? 'bg-emerald-50 dark:bg-emerald-950/40' : ''}`}>
                    <button
                      disabled={!current}
                      onClick={() => setEditing(p)}
                      title={current ? 'Clique para informar o preço' : 'Inicie uma compra primeiro'}
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left disabled:cursor-default sm:px-4"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                          checked ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {checked && '✓'}
                      </span>
                      <span className={`min-w-0 flex-1 ${checked ? `line-through ${ui.muted}` : ''}`}>
                        <span className="block truncate">{p.name}</span>
                        {!checked && priceStats[p.id] && (
                          <span className={`block text-xs ${ui.faint}`}>média {formatBRL(priceStats[p.id].avg)}</span>
                        )}
                      </span>
                      {item && (
                        <span className={`shrink-0 text-sm font-medium tabular-nums ${ui.accent}`}>
                          {item.qty > 1 && `${item.qty} × `}{formatBRL(item.price)}
                        </span>
                      )}
                    </button>
                    {checked ? (
                      <button onClick={() => onUncheck(p.id)} title="Tirar do carrinho" className={`px-3 py-3 hover:text-amber-600 ${ui.faint}`}>↩</button>
                    ) : (
                      <button onClick={() => onRemoveProduct(p.id)} title="Remover da lista" className={`px-3 py-3 text-xl leading-none hover:text-red-600 ${ui.faint}`}>×</button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}

      {current && (
        <button
          disabled={checkedCount === 0}
          onClick={() => setFinishing(true)}
          className={`${ui.btnDark} w-full rounded-xl py-3 text-lg font-semibold`}
        >
          Finalizar compra · {formatBRL(total)}
        </button>
      )}

      {editing && current && (
        <PriceModal
          product={editing}
          initial={current.items[editing.id]}
          stats={priceStats[editing.id]}
          onSave={(price, qty) => { onSaveItem(editing.id, price, qty); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}

      {finishing && current && (
        <FinishModal
          total={total}
          budget={current.budget}
          pending={pending}
          onConfirm={handleConfirmFinish}
          onClose={() => setFinishing(false)}
        />
      )}
    </section>
  )
}
