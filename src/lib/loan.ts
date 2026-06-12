import { MONTHS_IN_YEAR } from '../config/constants'
import type { LoanYearlyBreakdown } from '../types/simulation'

interface LoanInput {
  amount: number
  durationYears: number
  annualRate: number
  annualInsuranceRate: number
  horizonYears: number
}

export function calculateLoanSchedule(input: LoanInput): LoanYearlyBreakdown[] {
  const { amount, durationYears, annualRate, annualInsuranceRate, horizonYears } =
    input

  const totalMonths = durationYears * MONTHS_IN_YEAR
  const horizonMonths = horizonYears * MONTHS_IN_YEAR
  const monthlyRate = annualRate / MONTHS_IN_YEAR
  const monthlyInsurance = (amount * annualInsuranceRate) / MONTHS_IN_YEAR

  const monthlyPayment =
    monthlyRate === 0
      ? amount / totalMonths
      : (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths))

  const yearly: LoanYearlyBreakdown[] = Array.from({ length: horizonYears }, (_, i) => ({
    year: i + 1,
    capitalPaid: 0,
    interestPaid: 0,
    insurancePaid: 0,
    remainingCapital: 0,
  }))

  let remainingCapital = amount

  for (let month = 1; month <= Math.min(totalMonths, horizonMonths); month += 1) {
    const interest = remainingCapital * monthlyRate
    const plannedCapital = monthlyPayment - interest
    const capital = Math.min(plannedCapital, remainingCapital)

    remainingCapital -= capital

    const yearIndex = Math.ceil(month / MONTHS_IN_YEAR) - 1
    yearly[yearIndex].capitalPaid += capital
    yearly[yearIndex].interestPaid += interest
    yearly[yearIndex].insurancePaid += monthlyInsurance
    yearly[yearIndex].remainingCapital = remainingCapital
  }

  return yearly
}
