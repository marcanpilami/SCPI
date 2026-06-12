const EUR_FORMATTER = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const PERCENT_FORMATTER = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
})

export function formatEuro(value: number): string {
  return EUR_FORMATTER.format(value)
}

export function formatPercent(value: number): string {
  return PERCENT_FORMATTER.format(value)
}

export function formatMultiplier(value: number): string {
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}×`
}
