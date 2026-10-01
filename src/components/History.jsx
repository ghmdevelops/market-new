import { useState } from 'react'
import { formatBRL, formatDate, purchaseTotal } from '../utils'
import { ui } from '../ui'

const label = (p) => `${p.market ?? 'Mercado'} – ${formatDate(p.finishedAt)}`

export function History({ history, onDelete }) {
  const [a, setA] = useState(history[0]?.id ?? '')
  const [b, setB] = useState(history[1]?.id ?? '')

  if (history.length === 0) {
    return <p className={`mt-8 text-center ${ui.muted}`}>Nenhuma compra finalizada ainda.</p>
  }

  const pa = history.find((p) => p.id === a)
  const pb = history.find((p) => p.id === b)

  return (
    <section className="mt-4 space-y-6">
      <div>
        <h2 className={`mb-2 ${ui.heading}`}>Compras anteriores</h2>
        <ul className={`overflow-hidden ${ui.card} ${ui.divide}`}>
          {history.map((p) => <PurchaseRow key={p.id} purchase={p} onDelete={onDelete} />)}
        </ul>
      </div>

      {history.length >= 2 && (
        <div>
          <h2 className={`mb-2 ${ui.heading}`}>Comparar compras</h2>
          <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <select value={a} onChange={(e) => setA(e.target.value)} className={`${ui.select} min-w-0`}>
              {history.map((p) => <option key={p.id} value={p.id}>{label(p)}</option>)}
            </select>
            <span className={ui.faint}>vs</span>
            <select value={b} onChange={(e) => setB(e.target.value)} className={`${ui.select} min-w-0`}>
              {history.map((p) => <option key={p.id} value={p.id}>{label(p)}</option>)}
            </select>
          </div>
          {pa && pb && pa.id !== pb.id && <CompareTable a={pa} b={pb} />}
        </div>
      )}
    </section>
  )
}

function PurchaseRow({ purchase: p, onDelete }) {
  const [open, setOpen] = useState(false)
  const items = Object.values(p.items)
    .filter((i) => i.checked)
    .sort((x, y) => x.name.localeCompare(y.name))
  const over = p.budget && purchaseTotal(p) > p.budget

  return (
    <li>
      <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={open}
          title={open ? 'Recolher' : 'Ver itens'}
        >
          <span className={`text-xs transition-transform ${ui.faint} ${open ? 'rotate-90' : ''}`}>▶</span>
          <div className="min-w-0 flex-1">
            <strong className="block truncate">{p.market ?? 'Mercado'}</strong>
            <span className={`block text-xs ${ui.muted}`}>
              {formatDate(p.finishedAt)} · {items.length} itens
              {p.budget && <> · orçamento {formatBRL(p.budget)}</>}
            </span>
          </div>
        </button>
        <strong className={`shrink-0 tabular-nums ${over ? ui.up : ui.accent}`}>{formatBRL(purchaseTotal(p))}</strong>
        <button
          onClick={() => { if (confirm('Apagar esta compra?')) onDelete(p.id) }}
          title="Apagar"
          className={`shrink-0 px-1 text-xl leading-none hover:text-red-600 ${ui.faint}`}
        >
          ×
        </button>
      </div>

      {open && (
        <ul className={`border-t border-slate-100 bg-slate-50 text-sm dark:border-slate-800 dark:bg-slate-800/50 ${ui.rowDivide}`}>
          {items.map((i, idx) => (
            <li key={idx} className="flex items-center justify-between gap-3 px-4 py-2 pl-9 sm:pl-11">
              <span className="min-w-0 truncate">
                {i.name}
                {i.category && <span className={`ml-2 text-xs ${ui.faint}`}>{i.category}</span>}
              </span>
              <span className={`shrink-0 tabular-nums ${ui.muted}`}>
                {i.qty > 1 && <span className={ui.faint}>{i.qty} × {formatBRL(i.price)} = </span>}
                <strong>{formatBRL(i.price * i.qty)}</strong>
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

function Diff({ x, y }) {
  if (x === null || y === null) return <td className={`px-3 py-2 text-right ${ui.faint}`}>—</td>
  const d = y - x
  const color = d > 0 ? ui.up : d < 0 ? ui.down : ui.muted
  return <td className={`px-3 py-2 text-right font-medium tabular-nums ${color}`}>{d > 0 ? '+' : ''}{formatBRL(d)}</td>
}

function CompareTable({ a, b }) {
  const ids = [...new Set([...Object.keys(a.items), ...Object.keys(b.items)])]
  const rows = ids
    .map((id) => {
      const ia = a.items[id]
      const ib = b.items[id]
      return {
        id,
        name: ia?.name ?? ib?.name ?? id,
        pa: ia?.checked ? ia.price : null,
        pb: ib?.checked ? ib.price : null,
      }
    })
    .sort((x, y) => x.name.localeCompare(y.name))
  const ta = purchaseTotal(a)
  const tb = purchaseTotal(b)
  const cell = (v) => (v === null ? '—' : formatBRL(v))

  return (
    <div className={`overflow-x-auto ${ui.card}`}>
      <table className="w-full min-w-[22rem] text-sm">
        <thead className={ui.tableHead}>
          <tr>
            <th className="px-3 py-2">Produto</th>
            <th className="px-3 py-2 text-right">{formatDate(a.finishedAt)}</th>
            <th className="px-3 py-2 text-right">{formatDate(b.finishedAt)}</th>
            <th className="px-3 py-2 text-right">Dif.</th>
          </tr>
        </thead>
        <tbody className={ui.rowDivide}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="max-w-[10rem] truncate px-3 py-2">{r.name}</td>
              <td className="px-3 py-2 text-right tabular-nums">{cell(r.pa)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{cell(r.pb)}</td>
              <Diff x={r.pa} y={r.pb} />
            </tr>
          ))}
        </tbody>
        <tfoot className={`border-t-2 border-slate-200 font-semibold dark:border-slate-700 ${ui.tableHead}`}>
          <tr>
            <td className="px-3 py-2">Total</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatBRL(ta)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatBRL(tb)}</td>
            <Diff x={ta} y={tb} />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
