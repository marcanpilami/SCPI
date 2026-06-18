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

/**
 * Formate un nombre pour l'affichage dans un champ input type="number"
 * en fonction de la précision du step
 */
export function formatNumberInput(value: number, valueString: string, step: number): string {
  if (!Number.isFinite(value)) return ''
  if (valueString && valueString.length > 0 && (valueString[valueString.length - 1] === '.' || valueString[valueString.length - 1] === ',') || valueString.endsWith(',0') || valueString.endsWith('.0')) {
    // Si l'utilisateur a tapé un point, on ne veut pas le supprimer
    return valueString
  }
  
  // Déterminer le nombre de décimales basé sur le step
  const stepString = step.toString()
  const decimalIndex = stepString.indexOf('.')
  const decimals = decimalIndex === -1 ? 0 : stepString.length - decimalIndex - 1
  
  // Arrondir à ce nombre de décimales
  const multiplier = Math.pow(10, decimals)
  const rounded = Math.round(value * multiplier) / multiplier
  
  // Afficher sans zéros inutiles
  return rounded.toString()
}
