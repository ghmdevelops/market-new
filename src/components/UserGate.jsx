import { useEffect, useState } from 'react'
import { get, ref, update } from 'firebase/database'
import { db } from '../firebase'
import { normalizeUser, isValidUser } from '../hooks/useUser'
import { ui } from '../ui'

// Dados criados antes do sistema de apelidos ficavam na raiz (/products e /purchases).
// Se existirem, oferecemos mover tudo para users/<apelido> na primeira entrada.
async function loadLegacy() {
  const [p, c] = await Promise.all([get(ref(db, 'products')), get(ref(db, 'purchases'))])
  const products = p.val()
  const purchases = c.val()
  if (!products && !purchases) return null
  return {
    products,
    purchases,
    count: Object.keys(products ?? {}).length,
    purchasesCount: Object.keys(purchases ?? {}).length,
  }
}

async function migrateLegacy(user, legacy) {
  const target = (await get(ref(db, `users/${user}`))).val()
  if (target) throw new Error(`O apelido "${user}" já tem dados. Escolha outro ou entre sem importar.`)
  await update(ref(db), {
    [`users/${user}/products`]: legacy.products ?? null,
    [`users/${user}/purchases`]: legacy.purchases ?? null,
    products: null,
    purchases: null,
  })
}

export function UserGate({ onEnter }) {
  const [raw, setRaw] = useState('')
  const [legacy, setLegacy] = useState(null)
  const [importLegacy, setImportLegacy] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadLegacy().then(setLegacy).catch(() => {}) }, [])

  const name = normalizeUser(raw)
  const valid = isValidUser(name)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!valid || busy) return
    setBusy(true)
    setError('')
    try {
      if (legacy && importLegacy) await migrateLegacy(name, legacy)
      onEnter(name)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <div className={`p-6 ${ui.card}`}>
        <h1 className="text-2xl font-bold">Lista de Mercado</h1>
        <p className={`mt-1 text-sm ${ui.muted}`}>
          Escolha um apelido para guardar sua lista. Não precisa de cadastro nem senha.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block text-sm font-medium">
            Apelido
            <input
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="ex.: casa-da-ana"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={`${ui.input} mt-1 w-full text-lg`}
            />
          </label>
          {raw && (
            <p className={`text-xs ${valid ? ui.muted : ui.up}`}>
              {valid
                ? <>Será salvo como <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">{name}</code></>
                : '3 a 20 caracteres: letras, números, "_" ou "-".'}
            </p>
          )}

          {legacy && (
            <label className={`flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60`}>
              <input type="checkbox" checked={importLegacy} onChange={(e) => setImportLegacy(e.target.checked)} className="mt-0.5" />
              <span>
                Encontrei dados antigos neste banco ({legacy.count} produtos, {legacy.purchasesCount} compras).
                Mover para este apelido.
              </span>
            </label>
          )}

          {error && <p className={`text-sm ${ui.up}`}>{error}</p>}

          <button type="submit" disabled={!valid || busy} className={`${ui.btnPrimary} w-full py-2.5`}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
          <strong>Importante:</strong> o apelido é a única chave dos seus dados. Anote-o. Se esquecer ou digitar
          diferente, a lista e o histórico não poderão ser recuperados. Quem souber o apelido consegue ver e
          editar a lista por isso, evite nomes óbvios.
        </div>
      </div>
    </main>
  )
}
