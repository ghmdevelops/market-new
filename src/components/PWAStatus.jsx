import { ui } from '../ui'

function Toast({ children, onClose, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
    emerald: 'bg-emerald-600 text-white',
  }
  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-xl ${tones[tone]}`}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} aria-label="Fechar" className="text-lg leading-none opacity-70 hover:opacity-100">×</button>
      )}
    </div>
  )
}

export function PWAStatus({ pwa }) {
  const { needRefresh, offlineReady, update, dismiss, online } = pwa

  return (
    <>
      {!online && (
        <div className="sticky top-0 z-30 -mx-3 mb-3 bg-amber-500 px-3 py-1.5 text-center text-xs font-medium text-amber-950 sm:-mx-4">
          Você está offline — as alterações serão sincronizadas quando a conexão voltar.
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {needRefresh && (
          <Toast onClose={dismiss}>
            <span>Nova versão disponível.</span>
            <button onClick={update} className={`ml-3 font-semibold underline underline-offset-2 ${ui.accent} dark:text-emerald-700`}>
              Atualizar agora
            </button>
          </Toast>
        )}
        {offlineReady && !needRefresh && (
          <Toast tone="emerald" onClose={dismiss}>Pronto para usar offline.</Toast>
        )}
      </div>
    </>
  )
}
