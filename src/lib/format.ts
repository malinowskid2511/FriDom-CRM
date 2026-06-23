export function formatCost(cost: number | null | undefined) {
  if (cost == null) return '—'
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(cost)
}

export function parseCost(value: string): number | null {
  const trimmed = value.trim().replace(',', '.')
  if (!trimmed) return null
  const num = Number(trimmed)
  if (Number.isNaN(num) || num < 0) return null
  return Math.round(num * 100) / 100
}
