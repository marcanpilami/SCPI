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
  let rentComputationBase = input.investmentAmount;
  let endOfyearCapital = initialOutOfPocket
  let cashValuation = 0;

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

    endOfyearCapital += Math.max(0, effortAmount)
    
    const annualYield = endOfyearCapital > 0
    ? - effortAmount / endOfyearCapital
    : 0

    cashValuation += grossRents - taxesPaid - bankReimbursementTotal + Math.max(0, effortAmount);
    const endOfYearCashValuation = cashValuation;

    const endOfYearFixedAssetsValuation =
      assetValueStartOfYear * (1 + input.annualRevaluationRate)
    
    const endOfYearValuation =
      endOfYearFixedAssetsValuation -
      loan.remainingCapital +
      endOfYearCashValuation;

    const endofYearLatentProfit = endOfYearValuation - endOfyearCapital

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
      endOfYearFixedAssetsValuation,
      endOfYearCashValuation,
      endOfYearValuation,
      endOfyearCapital,
      endofYearLatentProfit,
    });

    assetValueStartOfYear = endOfYearFixedAssetsValuation
  }

  const summary = yearlyResults.reduce(
    (acc, row) => {
      acc.totalRents += row.grossRents;
      acc.totalBankReimbursement += row.bankReimbursementTotal;
      acc.totalTaxes += row.taxesPaid;
      acc.totalFees += row.bankInterestPaid;
      return acc;
    },
    {
      initialAssetValue:
        input.investmentAmount * (1 - input.subscriptionFeeRate),
      totalBorrowedAmount: loanPrincipal,
      // Accumulated fields
      totalFees: input.otherInitialExpenses,
      annualIncomeAfterLoan: 0,
      totalRents: 0,
      totalBankReimbursement: 0,
      totalTaxes: 0,
      // Final fields
      totalOutOfPocket:
        yearlyResults[yearlyResults.length - 1]?.endOfyearCapital ?? 0,
      finalFixedAssetsValue:
        yearlyResults[yearlyResults.length - 1]
          ?.endOfYearFixedAssetsValuation ?? 0,
      finalCashValue:
        yearlyResults[yearlyResults.length - 1]?.endOfYearCashValuation ?? 0,
      finalValuation:
        yearlyResults[yearlyResults.length - 1]?.endOfYearValuation ?? 0,
      finalLatentProfit:
        yearlyResults[yearlyResults.length - 1]?.endofYearLatentProfit ?? 0,
      // Fields computed later
      finalCapitalLatentGain: 0,
      leverageRatio: 0,
      yieldAtEndOfSimulation: 0,
      overallYearlyYield: 0,
      overallYearlyYieldWithLatentGains: 0,
    },
  );

  const repaymentYear = loanPrincipal > 0
    ? Math.min(input.loanDurationYears, input.horizonYears)
    : 1
  const repaymentRowIndex = Math.max(0, repaymentYear - 1)
  const repaymentReferenceRow = yearlyResults[repaymentRowIndex]
  const incomeAfterLoanRow = yearlyResults[Math.min(repaymentRowIndex + 1, yearlyResults.length - 1)]

  summary.leverageRatio = repaymentReferenceRow && repaymentReferenceRow.endOfyearCapital > 0
    ? repaymentReferenceRow.endOfYearFixedAssetsValuation / repaymentReferenceRow.endOfyearCapital
    : 0
  summary.annualIncomeAfterLoan = incomeAfterLoanRow
    ? incomeAfterLoanRow.grossRents - incomeAfterLoanRow.taxesPaid
    : 0
  summary.yieldAtEndOfSimulation = yearlyResults[yearlyResults.length - 1]
    ? yearlyResults[yearlyResults.length - 1].annualYield
    : 0;

  summary.finalCapitalLatentGain = summary.finalFixedAssetsValue - summary.totalOutOfPocket;

  summary.overallYearlyYield = summary.finalCashValue / (summary.totalOutOfPocket * yearlyResults.length);
  summary.overallYearlyYieldWithLatentGains = summary.finalLatentProfit / (summary.totalOutOfPocket * yearlyResults.length);

  return {
    yearlyResults,
    summary,
  }
}
