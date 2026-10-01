// Soma apenas os itens que estão no carrinho (checked)
export const purchaseTotal = (purchase) =>
  Object.values(purchase?.items ?? {})
    .filter((i) => i.checked)
    .reduce((sum, i) => sum + i.price * i.qty, 0)

export const formatBRL = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatDate = (ts) =>
  new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
