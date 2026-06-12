import { describe, expect, it } from 'vitest'
import { buildYearlyResultsCsv } from '../csv'

describe('buildYearlyResultsCsv', () => {
  it('exports header and one yearly line', () => {
    const csv = buildYearlyResultsCsv([
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
        assetValueEnd: 101000,
        globalProfitLoss: 500,
        cumulativeOutOfPocket: 51000,
        cumulativeProfit: 660,
      },
    ])

    const lines = csv.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('"Annee"')
    expect(lines[1]).toContain('"1"')
    expect(lines[1]).toContain('"1000.00"')
  })
})
