import { useState } from 'react'
import { useProducts } from './hooks/useProducts'
import { usePurchases } from './hooks/usePurchases'
import { useTheme } from './hooks/useTheme'
import { usePWA } from './hooks/usePWA'
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
  const [tab, setTab] = useState(initialTab)
  const { isDark, toggle } = useTheme()
  const pwa = usePWA()
  const { products, addProduct, addProducts, removeProduct, removeProducts } = useProducts()
  const { current, history, loading, priceStats, startPurchase, setItem, uncheckItem, finishPurchase, deletePurchase } = usePurchases()

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

  const handleRepeat = () => {
    if (!lastPurchase) return
    const items = Object.values(lastPurchase.items).filter((i) => i.checked)
    addProducts(items.map((i) => ({ name: i.name, category: i.category })))
  }

  return (
    <main className="mx-auto max-w-xl px-3 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4">
      <PWAStatus pwa={pwa} />
      <header className="mb-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold sm:text-2xl">Lista de Mercado</h1>
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
            onRemoveProduct={removeProduct}
            onRemoveProducts={removeProducts}
            onStart={startPurchase}
            onRepeat={handleRepeat}
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
