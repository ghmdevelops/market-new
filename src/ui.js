// Classes Tailwind reutilizadas (claro + escuro), para manter o visual consistente
export const ui = {
  card: 'rounded-xl bg-white shadow-sm dark:bg-slate-900 dark:shadow-none dark:ring-1 dark:ring-slate-800',
  divide: 'divide-y divide-slate-200 dark:divide-slate-800',
  input:
    'rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none ' +
    'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 ' +
    'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-emerald-900',
  select:
    'rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 ' +
    'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100',
  btnPrimary:
    'rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 active:scale-95 ' +
    'disabled:opacity-40 disabled:active:scale-100 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950',
  btnDark:
    'rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-900 active:scale-95 ' +
    'disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
  btnGhost:
    'rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50 ' +
    'dark:border-slate-700 dark:hover:bg-slate-800',
  muted: 'text-slate-500 dark:text-slate-400',
  faint: 'text-slate-400 dark:text-slate-500',
  heading: 'text-lg font-semibold text-slate-900 dark:text-slate-100',
  tableHead: 'bg-slate-50 text-left text-slate-600 dark:bg-slate-800/60 dark:text-slate-300',
  rowDivide: 'divide-y divide-slate-100 dark:divide-slate-800',
  modalBackdrop: 'fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4',
  modal:
    'w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl ' +
    'pb-[max(1.25rem,env(safe-area-inset-bottom))] dark:bg-slate-900 dark:ring-1 dark:ring-slate-800',
  up: 'text-red-600 dark:text-red-400',
  down: 'text-emerald-600 dark:text-emerald-400',
  accent: 'text-emerald-700 dark:text-emerald-400',
}
