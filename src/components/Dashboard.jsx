import { useMemo, useState } from 'react'
import { formatBRL, purchaseTotal } from '../utils'
import { DEFAULT_CATEGORY } from '../categories'
import { ui } from '../ui'

const monthKey = (ts) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const monthLabel = (key) => {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')
}

const groupByMonth = (history) => {
  const map = {}
  for (const p of history) {
    const key = monthKey(p.finishedAt)
    map[key] ??= { key, total: 0, count: 0 }
    map[key].total += purchaseTotal(p)
    map[key].count += 1
  }
  return Object.values(map).sort((a, b) => a.key.localeCompare(b.key))
}

const topProducts = (history, limit = 5) => {
  const map = {}
  for (const p of history) {
    for (const i of Object.values(p.items)) {
      if (!i.checked) continue
      map[i.name] ??= { name: i.name, total: 0, qty: 0 }
      map[i.name].total += i.price * i.qty
      map[i.name].qty += i.qty
    }
  }
  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, limit)
}

const byCategory = (history) => {
  const map = {}
  for (const p of history) {
    for (const i of Object.values(p.items)) {
      if (!i.checked) continue
      const cat = i.category ?? DEFAULT_CATEGORY
      map[cat] = (map[cat] ?? 0) + i.price * i.qty
    }
  }
  return Object.entries(map).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total)
}

const CAT_COLORS = ['bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500', 'bg-teal-500', 'bg-orange-500', 'bg-indigo-500', 'bg-lime-500', 'bg-pink-500', 'bg-slate-400']

const signed = (v) => `${v > 0 ? '+' : ''}${formatBRL(v)}`
const diffColor = (d) => (d === null ? ui.faint : d > 0 ? ui.up : d < 0 ? ui.down : ui.muted)

function Card({ title, value, sub, tone = 'slate' }) {
  const tones = { slate: '', emerald: ui.down, red: ui.up }
  return (
    <div className={`p-3 sm:p-4 ${ui.card}`}>
      <p className={`text-[11px] font-medium uppercase tracking-wide sm:text-xs ${ui.muted}`}>{title}</p>
      <p className={`mt-1 text-lg font-bold tabular-nums sm:text-xl ${tones[tone]}`}>{value}</p>
      {sub && <p className={`mt-0.5 text-xs ${ui.muted}`}>{sub}</p>}
    </div>
  )
}

export function Dashboard({ history }) {
  const [range, setRange] = useState(6)
  const months = useMemo(() => groupByMonth(history), [history])
  const top = useMemo(() => topProducts(history), [history])
  const cats = useMemo(() => byCategory(history), [history])

  if (history.length === 0) {
    return <p className={`mt-8 text-center ${ui.muted}`}>Finalize uma compra para ver o dashboard.</p>
  }

  const visible = range === 0 ? months : months.slice(-range)
  const max = Math.max(...visible.map((m) => m.total), 1)
  const grandTotal = history.reduce((s, p) => s + purchaseTotal(p), 0)
  const last = months[months.length - 1]
  const prev = months[months.length - 2]
  const diff = prev ? last.total - prev.total : null
  const diffPct = prev && prev.total > 0 ? (diff / prev.total) * 100 : null
  const biggest = months.reduce((a, b) => (b.total > a.total ? b : a))
  const avgPerPurchase = grandTotal / history.length

  return (
    <section className="mt-4 space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Card title="Mês atual" value={formatBRL(last.total)} sub={`${monthLabel(last.key)} · ${last.count} compra${last.count > 1 ? 's' : ''}`} />
        <Card
          title="vs mês anterior"
          value={diff === null ? '—' : signed(diff)}
          sub={diffPct === null ? 'sem mês anterior' : `${diffPct > 0 ? '+' : ''}${diffPct.toFixed(1)}% vs ${monthLabel(prev.key)}`}
          tone={diff === null ? 'slate' : diff > 0 ? 'red' : 'emerald'}
        />
        <Card title="Total geral" value={formatBRL(grandTotal)} sub={`${history.length} compras · média ${formatBRL(avgPerPurchase)}`} />
        <Card title="Mês que mais gastou" value={formatBRL(biggest.total)} sub={monthLabel(biggest.key)} />
      </div>

      <div className={`p-4 ${ui.card}`}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className={ui.heading}>Gastos por mês</h2>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs dark:bg-slate-800">
            {[3, 6, 12, 0].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded px-2 py-1 ${range === r ? 'bg-white font-medium shadow-sm dark:bg-slate-950' : ui.muted}`}
              >
                {r === 0 ? 'Tudo' : `${r}m`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-44 items-end gap-1.5 sm:h-48 sm:gap-2">
          {visible.map((m) => {
            const h = (m.total / max) * 100
            const isMax = m.key === biggest.key
            return (
              <div key={m.key} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${monthLabel(m.key)}: ${formatBRL(m.total)}`}>
                <span className={`hidden text-[10px] font-medium tabular-nums sm:block ${ui.muted}`}>{formatBRL(m.total)}</span>
                <div
                  className={`w-full rounded-t-md transition-all ${isMax ? 'bg-red-400 dark:bg-red-500' : 'bg-emerald-500'}`}
                  style={{ height: `${Math.max(h, 2)}%` }}
                />
                <span className={`truncate text-[10px] sm:text-[11px] ${ui.muted}`}>{monthLabel(m.key)}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className={`overflow-hidden ${ui.card}`}>
        <h2 className={`px-4 pt-4 ${ui.heading}`}>Evolução mensal</h2>
        <table className="mt-2 w-full text-sm">
          <thead className={ui.tableHead}>
            <tr>
              <th className="px-3 py-2 sm:px-4">Mês</th>
              <th className="px-3 py-2 text-right sm:px-4">Compras</th>
              <th className="px-3 py-2 text-right sm:px-4">Total</th>
              <th className="px-3 py-2 text-right sm:px-4">Variação</th>
            </tr>
          </thead>
          <tbody className={ui.rowDivide}>
            {[...months].reverse().map((m, idx, arr) => {
              const before = arr[idx + 1]
              const d = before ? m.total - before.total : null
              return (
                <tr key={m.key}>
                  <td className="px-3 py-2 capitalize sm:px-4">{monthLabel(m.key)}</td>
                  <td className="px-3 py-2 text-right tabular-nums sm:px-4">{m.count}</td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums sm:px-4">{formatBRL(m.total)}</td>
                  <td className={`px-3 py-2 text-right tabular-nums sm:px-4 ${diffColor(d)}`}>{d === null ? '—' : signed(d)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={`p-4 ${ui.card}`}>
        <h2 className={`mb-3 ${ui.heading}`}>Gastos por categoria</h2>
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          {cats.map((c, i) => (
            <div
              key={c.name}
              className={CAT_COLORS[i % CAT_COLORS.length]}
              style={{ width: `${(c.total / grandTotal) * 100}%` }}
              title={`${c.name}: ${formatBRL(c.total)}`}
            />
          ))}
        </div>
        <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
          {cats.map((c, i) => (
            <li key={c.name} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${CAT_COLORS[i % CAT_COLORS.length]}`} />
              <span className="min-w-0 flex-1 truncate">{c.name}</span>
              <span className={`tabular-nums ${ui.muted}`}>{((c.total / grandTotal) * 100).toFixed(0)}%</span>
              <strong className="w-24 text-right tabular-nums">{formatBRL(c.total)}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className={`p-4 ${ui.card}`}>
        <h2 className={`mb-2 ${ui.heading}`}>Onde mais gastei</h2>
        <ul className="space-y-2">
          {top.map((t) => (
            <li key={t.name}>
              <div className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{t.name} <span className={ui.faint}>× {t.qty}</span></span>
                <strong className="shrink-0 tabular-nums">{formatBRL(t.total)}</strong>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${(t.total / top[0].total) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
