import { describe, expect, it } from 'vitest'
import { buildYearlyResultsCsv } from '../csv'
import type { YearlyResult } from '../../types/simulation'

describe('buildYearlyResultsCsv', () => {
  it('exports header and one yearly line', () => {
    const rows: YearlyResult[] = [
      {
        year: 1,
        grossRents: 1000,
        annualYield: 0.05,
        taxableIncomeInFrance: 800,
        taxableIncomeAbroad: 200,
        taxesPaidInFrance: 300,
        taxesPaidAbroad: 40,
        bankCapitalRepaid: 400,
        bankInterestPaid: 300,
        bankReimbursementTotal: 700,
        loanInsurancePaid: 50,
        loanRemainingCapital: 150000,
        taxesPaid: 340,
        effortAmount: 120,
        endOfYearFixedAssetsValuation: 101000,
        endOfYearCashValuation: 220,
        endOfYearValuation: 500,
        endOfyearCapital: 51000,
        endofYearLatentProfit: -50500,
      },
    ]

    const csv = buildYearlyResultsCsv(rows)

    const lines = csv.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('"Annee"')
    expect(lines[0]).toContain('"Profit ou perte globale"')
    expect(lines[1]).toContain('"1"')
    expect(lines[1]).toContain('"1000.00"')
    expect(lines[1]).toContain('"500.00"')
  })
})
