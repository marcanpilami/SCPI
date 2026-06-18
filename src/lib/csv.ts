import type { YearlyResult } from '../types/simulation'

function toCsvCell(value: string): string {
  const escaped = value.replaceAll('"', '""')
  return `"${escaped}"`
}

const YEARLY_RESULT_COLUMNS = [
  { key: 'year', label: 'Annee' },
  { key: 'grossRents', label: 'Loyers bruts' },
  { key: 'grossRentsInFrance', label: 'Loyers bruts France' },
  { key: 'grossRentsAbroad', label: 'Loyers bruts etranger' },
  { key: 'annualYield', label: 'Rendement annuel' },
  { key: 'fiscalLandRevenueInFrance', label: 'Revenu foncier fiscal France' },
  { key: 'fiscalLandRevenueAbroad', label: 'Revenu foncier fiscal etranger' },
  { key: 'landDeficitInFrance', label: 'Deficit foncier France' },
  { key: 'landDeficitUsedInFrance', label: 'Deficit foncier utilise France' },
  { key: 'scpiTaxesPaidAbroad', label: 'Impots payes etranger' },
  { key: 'bankCapitalRepaid', label: 'Remboursement capital' },
  { key: 'bankInterestPaid', label: 'Interets payes' },
  { key: 'bankInterestPaidInFrance', label: 'Interets imputes France' },
  { key: 'bankInterestPaidAbroad', label: 'Interets imputes etranger' },
  { key: 'loanInsurancePaidInFrance', label: 'Assurance imputee France' },
  { key: 'loanInsurancePaidAbroad', label: 'Assurance imputee etranger' },
  { key: 'bankReimbursementTotal', label: 'Remboursement banque total' },
  { key: 'loanInsurancePaid', label: 'Assurance emprunteur' },
  { key: 'loanRemainingCapital', label: 'Capital restant du' },
  { key: 'scpiTaxesPaid', label: 'Impots SCPI totaux' },
  { key: 'scpiAverageTaxRate', label: 'Taux moyen fiscal SCPI' },
  { key: 'effortAmount', label: 'Effort net' },
  { key: 'endOfYearFixedAssetsValuation', label: 'Valeur immobilisee fin annee' },
  { key: 'endOfYearCashValuation', label: 'Tresorerie fin annee' },
  { key: 'endOfYearValuation', label: 'Valorisation totale fin annee' },
  { key: 'endOfyearCapital', label: 'Capital investi cumule' },
  { key: 'endofYearLatentProfit', label: 'Profit latent cumule' },
  { key: 'nonScpiTaxableIncome', label: 'Revenus hors SCPI imposables' },
  { key: 'nonScpiTaxableIncomeDeductions', label: 'Deductions hors SCPI' },
  { key: 'worldGrossIncome', label: 'Revenu brut mondial' },
  { key: 'worldTaxableIncome', label: 'Revenu imposable mondial' },
  { key: 'worldAverageTaxRate', label: 'Taux moyen fiscal mondial' },
  { key: 'theoreticalTaxesOnWorldInFrance', label: 'Impots theoriques mondiaux France' },
  { key: 'allIncomeTaxesPaidInFrance', label: 'Impots payes en France' },
  { key: 'socialContributionsFrance', label: 'Prelevements sociaux France' },
  { key: 'frenchTaxCreditToRemoveDoubleTaxes', label: 'Credit d impots anti double imposition' },
  { key: 'scpiFullFrenchScenarioTotalTaxes', label: 'Impots scenario 100 pourcent France' },
  { key: 'scpiFullFrenchScenarioFiscalImpact', label: 'Impact fiscal scenario 100 pourcent France' },
  { key: 'scpiFullFrenchScenarioAverageTaxRate', label: 'Taux moyen scenario 100 pourcent France' },
  {
    key: 'scpiFullFrenchScenarioAverageScpiTaxRate',
    label: 'Taux moyen fiscal SCPI scenario 100 pourcent France',
  },
  { key: 'yearlyTotalTaxesPaid', label: 'Impots totaux annuels' },
  { key: 'franceTheoreticalAverageIncomeTaxRate', label: 'Taux moyen theorique IR France' },
  { key: 'franceAverageIncomeTaxRate', label: 'Taux moyen reel IR France' },
] as const satisfies ReadonlyArray<{ key: keyof YearlyResult; label: string }>

function formatCsvNumber(column: keyof YearlyResult, value: number): string {
  if (column === 'year') {
    return String(Math.trunc(value))
  }

  return value.toFixed(2)
}

export function buildYearlyResultsCsv(rows: YearlyResult[]): string {
  const headers = YEARLY_RESULT_COLUMNS.map((column) => column.label)

  const lines = rows.map((row) =>
    YEARLY_RESULT_COLUMNS
      .map((column) => formatCsvNumber(column.key, row[column.key]))
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
