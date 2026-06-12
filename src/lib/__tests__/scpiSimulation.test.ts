import { describe, expect, it } from 'vitest'
import { simulateScpiInvestment } from '../scpiSimulation'
import { DEFAULT_SIMULATION_INPUT } from '../../config/constants'

describe('simulateScpiInvestment', () => {
  it('returns one row per simulated year', () => {
    const output = simulateScpiInvestment(DEFAULT_SIMULATION_INPUT)

    expect(output.yearlyResults).toHaveLength(DEFAULT_SIMULATION_INPUT.horizonYears)
  })

  it('does not reimburse bank without loan', () => {
    const output = simulateScpiInvestment({
      ...DEFAULT_SIMULATION_INPUT,
      useLoan: false,
      horizonYears: 5,
    })

    expect(output.yearlyResults.every((row) => row.bankReimbursementTotal === 0)).toBe(
      true,
    )
  })

  it('shows taxes when taxable income is positive', () => {
    const output = simulateScpiInvestment({
      ...DEFAULT_SIMULATION_INPUT,
      distributionRate: 0.08,
      otherInitialExpenses: 100,
      horizonYears: 3,
    })

    expect(output.yearlyResults.some((row) => row.taxesPaid > 0)).toBe(true)
  })

  it('uses effort formula traite - (loyers - impôts)', () => {
    const output = simulateScpiInvestment({
      ...DEFAULT_SIMULATION_INPUT,
      distributionRate: 0.06,
      otherInitialExpenses: 0,
      horizonYears: 2,
    })

    output.yearlyResults.forEach((row) => {
      const expectedEffort =
        row.bankReimbursementTotal - (row.grossRents - row.taxesPaid)
      expect(row.effortAmount).toBeCloseTo(expectedEffort, 8)
    })
  })

  it('computes different out of pocket effort with and without loan', () => {
    const withLoan = simulateScpiInvestment({
      ...DEFAULT_SIMULATION_INPUT,
      useLoan: true,
      horizonYears: 10,
    })
    const withoutLoan = simulateScpiInvestment({
      ...DEFAULT_SIMULATION_INPUT,
      useLoan: false,
      horizonYears: 10,
    })

    expect(withLoan.summary.totalOutOfPocket).not.toBe(withoutLoan.summary.totalOutOfPocket)
  })

  it('reduces bank reimbursement when down payment is higher', () => {
    const lowDownPayment = simulateScpiInvestment({
      ...DEFAULT_SIMULATION_INPUT,
      useLoan: true,
      downPaymentAmount: 10000,
      horizonYears: 5,
    })

    const highDownPayment = simulateScpiInvestment({
      ...DEFAULT_SIMULATION_INPUT,
      useLoan: true,
      downPaymentAmount: 70000,
      horizonYears: 5,
    })

    expect(highDownPayment.summary.totalBankReimbursement).toBeLessThan(
      lowDownPayment.summary.totalBankReimbursement,
    )
  })

  it('splits revenue and taxes between France and abroad', () => {
    const output = simulateScpiInvestment({
      ...DEFAULT_SIMULATION_INPUT,
      revenueInFranceRate: 0.6,
      foreignTaxRate: 0.2,
      horizonYears: 2,
    })

    output.yearlyResults.forEach((row) => {
      const totalRevenueInFrance = row.grossRents * 0.6
      const totalRevenueAbroad = row.grossRents * 0.4
      expect(row.taxableIncomeInFrance).toBeLessThanOrEqual(totalRevenueInFrance)
      expect(row.taxableIncomeAbroad).toBeCloseTo(totalRevenueAbroad, 2)
      expect(row.taxesPaid).toBeCloseTo(
        row.taxesPaidInFrance + row.taxesPaidAbroad,
        8,
      )
    })
  })

  it('applies enjoyment delay before receiving rents', () => {
    const output = simulateScpiInvestment({
      ...DEFAULT_SIMULATION_INPUT,
      investmentAmount: 200000,
      subscriptionFeeRate: 0,
      distributionRate: 0.06,
      annualRevaluationRate: 0,
      enjoymentDelayMonths: 6,
      horizonYears: 2,
    })

    expect(output.yearlyResults[0].grossRents).toBeCloseTo(6000, 6)
    expect(output.yearlyResults[1].grossRents).toBeCloseTo(12000, 6)
  })

  it('computes final capital latent gain from assets and out of pocket', () => {
    const output = simulateScpiInvestment({
      ...DEFAULT_SIMULATION_INPUT,
      horizonYears: 8,
    })

    expect(output.summary.finalCapitalLatentGain).toBeCloseTo(
      output.summary.finalFixedAssetsValue - output.summary.totalOutOfPocket,
      8,
    )
  })

  it('computes overall yearly yield metrics from final values', () => {
    const output = simulateScpiInvestment({
      ...DEFAULT_SIMULATION_INPUT,
      horizonYears: 6,
    })

    const denominator = output.summary.totalOutOfPocket * output.yearlyResults.length
    expect(output.summary.overallYearlyYield).toBeCloseTo(
      output.summary.finalCashValue / denominator,
      8,
    )
    expect(output.summary.overallYearlyYieldWithLatentGains).toBeCloseTo(
      output.summary.finalLatentProfit / denominator,
      8,
    )
  })
})
