import { formatBRL } from '../utils'
import { ui } from '../ui'

export function FinishModal({ total, budget, pending, onConfirm, onClose }) {
  const over = budget && total > budget
  const n = pending.length

  return (
    <div className={ui.modalBackdrop} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={ui.modal}>
        <h2 className="text-xl font-semibold">Finalizar compra</h2>
        <p className={`mt-1 ${ui.muted}`}>
          Total: <strong className={over ? ui.up : ui.accent}>{formatBRL(total)}</strong>
          {budget && <span className="text-sm"> · orçamento {formatBRL(budget)}</span>}
        </p>

        {n > 0 ? (
          <>
            <p className="mt-4 text-sm font-medium">
              {n} ite{n > 1 ? 'ns' : 'm'} não foi{n > 1 ? 'ram' : ''} comprado{n > 1 ? 's' : ''}:
            </p>
            <ul className={`mt-1 max-h-40 overflow-y-auto rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800 ${ui.muted}`}>
              {pending.map((p) => <li key={p.id}>• {p.name}</li>)}
            </ul>
            <div className="mt-4 space-y-2">
              <button onClick={() => onConfirm('keep')} className={`${ui.btnPrimary} w-full py-2.5`}>
                Finalizar e manter na lista
              </button>
              <button
                onClick={() => onConfirm('remove')}
                className="w-full rounded-lg border border-red-300 px-4 py-2.5 font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
              >
                Finalizar e remover da lista
              </button>
            </div>
          </>
        ) : (
          <button onClick={() => onConfirm('keep')} className={`${ui.btnPrimary} mt-4 w-full py-2.5`}>Confirmar</button>
        )}
        <button onClick={onClose} className={`mt-2 w-full rounded-lg px-4 py-2.5 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 ${ui.muted}`}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
