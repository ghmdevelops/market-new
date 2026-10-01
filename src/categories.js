// Ordem = ordem em que normalmente se percorre o mercado
export const CATEGORIES = [
  'Hortifruti',
  'Padaria',
  'Açougue',
  'Frios e Laticínios',
  'Mercearia',
  'Bebidas',
  'Congelados',
  'Limpeza',
  'Higiene',
  'Pet',
  'Outros',
]

export const DEFAULT_CATEGORY = 'Outros'

export const categoryOrder = (cat) => {
  const idx = CATEGORIES.indexOf(cat)
  return idx === -1 ? CATEGORIES.length : idx
}
