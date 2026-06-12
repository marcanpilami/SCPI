import type { YearlyResult } from '../types/simulation'

function toCsvCell(value: string): string {
  const escaped = value.replaceAll('"', '""')
  return `"${escaped}"`
}

export function buildYearlyResultsCsv(rows: YearlyResult[]): string {
  const headers = [
    'Annee',
    'Loyers bruts',
    'Revenu imposable France',
    'Revenu imposable reste monde',
    'Impots France',
    'Impots reste monde',
    'Remboursement banque total',
    'Remboursement capital',
    'Interets payes',
    'Capital restant du',
    'Assurance emprunteur',
    'Impots total',
    'Effort net',
    'Valeur des actifs fin annee',
    'Profit ou perte globale',
  ]

  const lines = rows.map((row) =>
    [
      String(row.year),
      row.grossRents.toFixed(2),
      row.taxableIncomeInFrance.toFixed(2),
      row.taxableIncomeAbroad.toFixed(2),
      row.taxesPaidInFrance.toFixed(2),
      row.taxesPaidAbroad.toFixed(2),
      row.bankReimbursementTotal.toFixed(2),
      row.bankCapitalRepaid.toFixed(2),
      row.bankInterestPaid.toFixed(2),
      row.loanRemainingCapital.toFixed(2),
      row.loanInsurancePaid.toFixed(2),
      row.taxesPaid.toFixed(2),
      row.effortAmount.toFixed(2),
      row.endOfYearFixedAssetsValuation.toFixed(2),
      row.endOfYearValuation.toFixed(2),
    ]
      .map(toCsvCell)
      .join(','),
  )

  return [headers.map(toCsvCell).join(','), ...lines].join('\n')
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
