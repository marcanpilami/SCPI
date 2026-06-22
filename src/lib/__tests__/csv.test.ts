import { describe, expect, it } from 'vitest'
import { buildYearlyResultsCsv } from '../csv'
import type { YearlyResult } from '../../types/simulation'

function makeYearlyResult(overrides: Partial<YearlyResult> = {}): YearlyResult {
  return {
    year: 1,
    grossRents: 1000,
    grossRentsInFrance: 700,
    grossRentsAbroad: 300,
    annualYield: 0.05,
    fiscalLandRevenueInFrance: 600,
    fiscalLandRevenueAbroad: 250,
    landDeficitInFrance: 0,
    landDeficitUsedInFrance: 0,
    scpiTaxesPaidAbroad: 40,
    bankCapitalRepaid: 400,
    bankInterestPaid: 300,
    bankInterestPaidInFrance: 210,
    bankInterestPaidAbroad: 90,
    loanInsurancePaidInFrance: 35,
    loanInsurancePaidAbroad: 15,
    bankReimbursementTotal: 700,
    loanInsurancePaid: 50,
    loanRemainingCapital: 150000,
    scpiTaxesPaid: 340,
    scpiAverageTaxRate: 0.34,
    effortAmount: 120,
    endOfYearFixedAssetsValuation: 101000,
    endOfYearCashValuation: 220,
    endOfYearValuation: 500,
    endOfyearCapital: 51000,
    endofYearLatentProfit: -50500,
    nonScpiTaxableIncome: 10000,
    nonScpiTaxableIncomeDeductions: 2000,
    worldGrossIncome: 11000,
    worldTaxableIncome: 9500,
    worldAverageTaxRate: 0.2,
    theoreticalTaxesOnWorldInFrance: 2200,
    allIncomeTaxesPaidInFrance: 2000,
    socialContributionsFrance: 100,
    frenchTaxCreditToRemoveDoubleTaxes: 80,    
    yearlyTotalTaxesPaid: 2140,
    franceTheoreticalAverageIncomeTaxRate: 0.22,
    franceAverageIncomeTaxRate: 0.21,
    yearlyTotalTaxesPaidOnScpi: 340,
    ...overrides,
  }
}

describe('buildYearlyResultsCsv', () => {
  it('exports header and one yearly line', () => {
    const rows: YearlyResult[] = [makeYearlyResult()]

    const csv = buildYearlyResultsCsv(rows)

    const lines = csv.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('"Annee"')
    expect(lines[0]).toContain('"Loyers bruts France"')
    expect(lines[0]).toContain('"Taux moyen reel IR France"')
    expect(lines[1]).toContain('"1"')
    expect(lines[1]).toContain('"1000.00"')
    expect(lines[1]).toContain('"700.00"')
    expect(lines[1]).toContain('"500.00"')
  })
})
