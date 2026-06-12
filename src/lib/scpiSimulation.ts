import {
  INPUT_LIMITS,
  SOCIAL_CONTRIBUTIONS_RATE,
} from '../config/constants'
import { calculateLoanSchedule } from './loan'
import type {
  LoanYearlyBreakdown,
  SimulationInput,
  SimulationOutput,
  YearlyResult,
} from '../types/simulation'

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function normalizeInput(rawInput: SimulationInput): SimulationInput {
  return {
    ...rawInput,
    downPaymentAmount: clamp(
      rawInput.downPaymentAmount,
      INPUT_LIMITS.downPaymentAmount.min,
      INPUT_LIMITS.downPaymentAmount.max,
    ),
    loanDurationYears: clamp(
      rawInput.loanDurationYears,
      INPUT_LIMITS.loanDurationYears.min,
      INPUT_LIMITS.loanDurationYears.max,
    ),
    loanAnnualRate: clamp(
      rawInput.loanAnnualRate,
      INPUT_LIMITS.loanAnnualRate.min,
      INPUT_LIMITS.loanAnnualRate.max,
    ),
    loanAnnualInsuranceRate: clamp(
      rawInput.loanAnnualInsuranceRate,
      INPUT_LIMITS.loanAnnualInsuranceRate.min,
      INPUT_LIMITS.loanAnnualInsuranceRate.max,
    ),
    otherInitialExpenses: clamp(
      rawInput.otherInitialExpenses,
      INPUT_LIMITS.otherInitialExpenses.min,
      INPUT_LIMITS.otherInitialExpenses.max,
    ),
    enjoymentDelayMonths: clamp(
      rawInput.enjoymentDelayMonths,
      INPUT_LIMITS.enjoymentDelayMonths.min,
      INPUT_LIMITS.enjoymentDelayMonths.max,
    ),
    distributionRate: clamp(
      rawInput.distributionRate,
      INPUT_LIMITS.distributionRate.min,
      INPUT_LIMITS.distributionRate.max,
    ),
    subscriptionFeeRate: clamp(
      rawInput.subscriptionFeeRate,
      INPUT_LIMITS.subscriptionFeeRate.min,
      INPUT_LIMITS.subscriptionFeeRate.max,
    ),
    investmentAmount: clamp(
      rawInput.investmentAmount,
      INPUT_LIMITS.investmentAmount.min,
      INPUT_LIMITS.investmentAmount.max,
    ),
    taxBracketRate: clamp(
      rawInput.taxBracketRate,
      INPUT_LIMITS.taxBracketRate.min,
      INPUT_LIMITS.taxBracketRate.max,
    ),
    revenueInFranceRate: clamp(
      rawInput.revenueInFranceRate,
      INPUT_LIMITS.revenueInFranceRate.min,
      INPUT_LIMITS.revenueInFranceRate.max,
    ),
    foreignTaxRate: clamp(
      rawInput.foreignTaxRate,
      INPUT_LIMITS.foreignTaxRate.min,
      INPUT_LIMITS.foreignTaxRate.max,
    ),
    annualRevaluationRate: clamp(
      rawInput.annualRevaluationRate,
      INPUT_LIMITS.annualRevaluationRate.min,
      INPUT_LIMITS.annualRevaluationRate.max,
    ),
    horizonYears: clamp(
      rawInput.horizonYears,
      INPUT_LIMITS.horizonYears.min,
      INPUT_LIMITS.horizonYears.max,
    ),
  }
}

function emptyLoanBreakdown(year: number): LoanYearlyBreakdown {
  return {
    year,
    capitalPaid: 0,
    interestPaid: 0,
    insurancePaid: 0,
    remainingCapital: 0,
  }
}

export function simulateScpiInvestment(rawInput: SimulationInput): SimulationOutput {
  const input = normalizeInput(rawInput)

  const effectiveDownPayment = input.useLoan
    ? Math.min(input.downPaymentAmount, input.investmentAmount)
    : input.investmentAmount
  const loanPrincipal = input.useLoan
    ? Math.max(0, input.investmentAmount + input.otherInitialExpenses - effectiveDownPayment)
    : 0

  const initialOutOfPocket = (input.useLoan ? effectiveDownPayment : input.investmentAmount)

  const loanSchedule = input.useLoan && loanPrincipal > 0
    ? calculateLoanSchedule({
        amount: loanPrincipal,
        durationYears: input.loanDurationYears,
        annualRate: input.loanAnnualRate,
        annualInsuranceRate: input.loanAnnualInsuranceRate,
        horizonYears: input.horizonYears,
      })
    : Array.from({ length: input.horizonYears }, (_, i) => emptyLoanBreakdown(i + 1))

  let assetValueStartOfYear = input.investmentAmount * (1 - input.subscriptionFeeRate)
  let cumulativeOutOfPocket = initialOutOfPocket
  let cumulativeProfit = 0
  let rentComputationBase = input.investmentAmount;

  const yearlyResults: YearlyResult[] = []

  const totalTaxRateFrance = input.taxBracketRate + SOCIAL_CONTRIBUTIONS_RATE

  for (let year = 1; year <= input.horizonYears; year += 1) {
    const loan = loanSchedule[year - 1] ?? emptyLoanBreakdown(year)

    const monthStart = (year - 1) * 12
    const monthEnd = year * 12
    const rentableMonthsUntilStart = Math.max(0, monthStart - input.enjoymentDelayMonths)
    const rentableMonthsUntilEnd = Math.max(0, monthEnd - input.enjoymentDelayMonths)
    const rentMonthsInYear = rentableMonthsUntilEnd - rentableMonthsUntilStart
    const rentProration = rentMonthsInYear / 12

    const grossRents = rentComputationBase * input.distributionRate * rentProration;
    const deductibleCharges =
      (loan.interestPaid + loan.insurancePaid) * input.revenueInFranceRate;
    
    const revenueInFrance = grossRents * input.revenueInFranceRate
    const revenueAbroad = grossRents * (1 - input.revenueInFranceRate)
    
    const taxableIncomeInFrance = Math.max(0, revenueInFrance - deductibleCharges)
    const taxableIncomeAbroad = Math.max(0, revenueAbroad)
    
    const taxesPaidInFrance = taxableIncomeInFrance * totalTaxRateFrance
    const taxesPaidAbroad = taxableIncomeAbroad * input.foreignTaxRate
    const taxesPaid = taxesPaidInFrance + taxesPaidAbroad

    const bankReimbursementTotal = loan.capitalPaid + loan.interestPaid
    const effortAmount = bankReimbursementTotal - (grossRents - taxesPaid)

    cumulativeOutOfPocket += Math.max(0, effortAmount)
    cumulativeProfit -= Math.min(0, effortAmount)

    const annualYield = cumulativeOutOfPocket > 0
      ? - effortAmount / cumulativeOutOfPocket
      : 0

    const assetValueEndOfYear =
      assetValueStartOfYear * (1 + input.annualRevaluationRate)
    const globalProfitLoss =
      assetValueEndOfYear -
      cumulativeOutOfPocket -
      loan.remainingCapital +
      cumulativeProfit;

    rentComputationBase *= (1 + input.annualRevaluationRate)

    yearlyResults.push({
      year,
      grossRents,
      annualYield,
      taxableIncomeInFrance,
      taxableIncomeAbroad,
      taxesPaidInFrance,
      taxesPaidAbroad,
      bankCapitalRepaid: loan.capitalPaid,
      bankInterestPaid: loan.interestPaid,
      bankReimbursementTotal,
      loanInsurancePaid: loan.insurancePaid,
      loanRemainingCapital: loan.remainingCapital,
      taxesPaid,
      effortAmount,
      assetValueEnd: assetValueEndOfYear,
      globalProfitLoss,
      cumulativeOutOfPocket,
      cumulativeProfit,
    });

    assetValueStartOfYear = assetValueEndOfYear
  }

  const summary = yearlyResults.reduce(
    (acc, row) => {
      acc.totalRents += row.grossRents
      acc.totalBankReimbursement += row.bankReimbursementTotal
      acc.totalTaxes += row.taxesPaid
      acc.totalEffort += Math.max(0, row.effortAmount)
      acc.totalFees += row.bankInterestPaid
      return acc
    },
    {
      initialAssetValue: input.investmentAmount * (1 - input.subscriptionFeeRate),
      totalBorrowedAmount: loanPrincipal,
      totalFees: input.otherInitialExpenses,
      annualIncomeAfterLoan: 0,
      totalRents: 0,
      totalBankReimbursement: 0,
      totalTaxes: 0,
      totalEffort: 0,
      totalOutOfPocket: initialOutOfPocket,
      finalAssetValue: yearlyResults[yearlyResults.length - 1]?.assetValueEnd ?? 0,
      finalProfitLoss: yearlyResults[yearlyResults.length - 1]?.globalProfitLoss ?? 0,
      leverageRatio: 0,
    },
  )

  summary.totalOutOfPocket = initialOutOfPocket + summary.totalEffort
  summary.finalProfitLoss = summary.finalAssetValue - summary.totalOutOfPocket

  const repaymentYear = loanPrincipal > 0
    ? Math.min(input.loanDurationYears, input.horizonYears)
    : 1
  const repaymentRowIndex = Math.max(0, repaymentYear - 1)
  const repaymentReferenceRow = yearlyResults[repaymentRowIndex]
  const incomeAfterLoanRow = yearlyResults[Math.min(repaymentRowIndex + 1, yearlyResults.length - 1)]

  summary.leverageRatio = repaymentReferenceRow && repaymentReferenceRow.cumulativeOutOfPocket > 0
    ? repaymentReferenceRow.assetValueEnd / repaymentReferenceRow.cumulativeOutOfPocket
    : 0
  summary.annualIncomeAfterLoan = incomeAfterLoanRow
    ? incomeAfterLoanRow.grossRents - incomeAfterLoanRow.taxesPaid
    : 0

  return {
    yearlyResults,
    summary,
  }
}
