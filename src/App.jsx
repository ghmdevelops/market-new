import { useRef, useState } from 'react'
import { useProducts } from './hooks/useProducts'
import { useFavorites } from './hooks/useFavorites'
import { usePurchases } from './hooks/usePurchases'
import { useTheme } from './hooks/useTheme'
import { usePWA } from './hooks/usePWA'
import { useUser } from './hooks/useUser'
import { UserGate } from './components/UserGate'
import { ProductForm } from './components/ProductForm'
import { ShoppingList } from './components/ShoppingList'
import { History } from './components/History'
import { Dashboard } from './components/Dashboard'
import { PWAStatus } from './components/PWAStatus'
import { ui } from './ui'

const TABS = [
  { id: 'list', label: 'Lista' },
  { id: 'history', label: 'Histórico' },
  { id: 'dash', label: 'Dashboard' },
]

// Aba inicial vinda dos atalhos do PWA (?tab=history) ou padrão
const initialTab = () => {
  const t = new URLSearchParams(location.search).get('tab')
  return TABS.some((x) => x.id === t) ? t : 'list'
}

export default function App() {
  const { user, setUser, logout } = useUser()
  useTheme() // garante que o tema seja aplicado também na tela de entrada
  if (!user) return <UserGate onEnter={setUser} />
  return <MarketApp key={user} user={user} onLogout={logout} />
}

function MarketApp({ user, onLogout }) {
  const [tab, setTab] = useState(initialTab)
  const { isDark, toggle } = useTheme()
  const pwa = usePWA()
  const { products, addProduct, addProducts, updateProduct, removeProduct, restoreProduct, removeProducts } = useProducts(user)
  const { current, history, loading, priceStats, startPurchase, setItem, uncheckItem, finishPurchase, deletePurchase } = usePurchases(user)
  const { favorites, isFavorite, toggleFavorite } = useFavorites(user)

  const lastPurchase = history[0] ?? null

  const handleSaveItem = (productId, price, qty) => {
    if (!current) return
    const product = products.find((p) => p.id === productId)
    setItem(current.id, productId, {
      name: product?.name ?? '',
      category: product?.category ?? 'Outros',
      price,
      qty,
      checked: true,
      checkedAt: Date.now(),
    })
  }

  // Toast: { msg, action?: { label, run } }
  const [notice, setNotice] = useState(null)
  const timerRef = useRef(null)
  const notify = (msg, action = null, ms = 4000) => {
    clearTimeout(timerRef.current)
    setNotice({ msg, action })
    timerRef.current = setTimeout(() => setNotice(null), ms)
  }

  const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`
  const reportAdded = ({ added, skipped }) => {
    if (added === 0) notify(`Nenhum item novo — ${plural(skipped, 'item já estava', 'itens já estavam')} na lista.`)
    else if (skipped === 0) notify(`${plural(added, 'item adicionado', 'itens adicionados')} à lista.`)
    else notify(`${plural(added, 'item adicionado', 'itens adicionados')} · ${plural(skipped, 'já estava', 'já estavam')} na lista.`)
  }

  const handleRepeat = async () => {
    if (!lastPurchase) return
    const items = Object.values(lastPurchase.items).filter((i) => i.checked)
    reportAdded(await addProducts(items.map((i) => ({ name: i.name, category: i.category }))))
  }

  const handleAddFavorites = async () => reportAdded(await addProducts(favorites))

  const handleRemove = (product) => {
    removeProduct(product.id)
    notify(`"${product.name}" removido.`, { label: 'Desfazer', run: () => restoreProduct(product) }, 5000)
  }

  return (
    <main className="mx-auto max-w-xl px-3 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4">
      <PWAStatus pwa={pwa} />
      {notice && (
        <div
          role="status"
          className="fixed inset-x-0 top-3 z-40 mx-auto flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-3 rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-xl dark:bg-slate-100 dark:text-slate-900"
        >
          <span className="truncate">{notice.msg}</span>
          {notice.action && (
            <button
              onClick={() => { notice.action.run(); setNotice(null) }}
              className="shrink-0 font-semibold text-emerald-300 underline underline-offset-2 dark:text-emerald-700"
            >
              {notice.action.label}
            </button>
          )}
        </div>
      )}
      <header className="mb-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl">Lista de Mercado</h1>
            <p className={`truncate text-xs ${ui.muted}`}>
              @{user} ·{' '}
              <button
                onClick={() => { if (confirm(`Sair de "${user}"? Anote o apelido para entrar de novo.`)) onLogout() }}
                className="underline underline-offset-2 hover:text-slate-800 dark:hover:text-slate-200"
              >
                trocar
              </button>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pwa.canInstall && (
              <button onClick={pwa.install} className={`${ui.btnPrimary} px-3 py-1.5 text-sm`}>
                Instalar
              </button>
            )}
            <button
              onClick={toggle}
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              title={isDark ? 'Modo claro' : 'Modo escuro'}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-lg hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              {isDark ? '☀' : '☾'}
            </button>
          </div>
        </div>
        <nav className="grid grid-cols-3 gap-1 rounded-lg bg-slate-200 p-1 dark:bg-slate-800">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
              {t.id === 'list' && products.length > 0 && (
                <span className="ml-1 text-xs opacity-70">({products.length})</span>
              )}
              {t.id === 'history' && history.length > 0 && (
                <span className="ml-1 text-xs opacity-70">({history.length})</span>
              )}
            </button>
          ))}
        </nav>
      </header>

      {loading ? (
        <p className={`mt-8 text-center ${ui.muted}`}>Carregando…</p>
      ) : tab === 'list' ? (
        <>
          <ProductForm onAdd={addProduct} />
          <ShoppingList
            products={products}
            current={current}
            lastPurchase={lastPurchase}
            priceStats={priceStats}
            favorites={favorites}
            isFavorite={isFavorite}
            onRemoveProduct={handleRemove}
            onRemoveProducts={removeProducts}
            onUpdateProduct={updateProduct}
            onToggleFavorite={toggleFavorite}
            onStart={startPurchase}
            onRepeat={handleRepeat}
            onAddFavorites={handleAddFavorites}
            onSaveItem={handleSaveItem}
            onUncheck={(id) => uncheckItem(current.id, id)}
            onFinish={() => finishPurchase(current.id)}
          />
        </>
      ) : tab === 'history' ? (
        <History history={history} onDelete={deletePurchase} />
      ) : (
        <Dashboard history={history} />
      )}
    </main>
  )
}
