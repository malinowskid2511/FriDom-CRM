export interface EarningsCertRow {
  cost: number | null
  issue_date: string | null
  created_at: string
}

export interface EarningsSummary {
  total: number
  count: number
  year: number
  month: number | null
}

export function certificateRevenueDate(issueDate: string | null, createdAt: string): Date {
  return new Date(issueDate ?? createdAt)
}

export function sumEarnings(
  certs: EarningsCertRow[],
  year: number,
  month: number | null,
): EarningsSummary {
  let total = 0
  let count = 0

  for (const cert of certs) {
    if (cert.cost == null) continue
    const d = certificateRevenueDate(cert.issue_date, cert.created_at)
    if (d.getFullYear() !== year) continue
    if (month != null && d.getMonth() + 1 !== month) continue
    total += cert.cost
    count++
  }

  return { total, count, year, month }
}

export function yearsFromCertificates(certs: EarningsCertRow[], span = 5): number[] {
  const years = new Set<number>()
  const current = new Date().getFullYear()
  for (let y = current; y >= current - span; y--) {
    years.add(y)
  }
  for (const cert of certs) {
    years.add(certificateRevenueDate(cert.issue_date, cert.created_at).getFullYear())
  }
  return [...years].sort((a, b) => b - a)
}

export const MONTH_OPTIONS = [
  { value: 'all', label: 'Cały rok' },
  { value: '1', label: 'Styczeń' },
  { value: '2', label: 'Luty' },
  { value: '3', label: 'Marzec' },
  { value: '4', label: 'Kwiecień' },
  { value: '5', label: 'Maj' },
  { value: '6', label: 'Czerwiec' },
  { value: '7', label: 'Lipiec' },
  { value: '8', label: 'Sierpień' },
  { value: '9', label: 'Wrzesień' },
  { value: '10', label: 'Październik' },
  { value: '11', label: 'Listopad' },
  { value: '12', label: 'Grudzień' },
] as const

export function earningsPeriodLabel(year: number, month: number | null): string {
  if (month == null) return `Rok ${year}`
  const name = MONTH_OPTIONS.find((m) => m.value === String(month))?.label
  return name ? `${name} ${year}` : `${month}/${year}`
}
