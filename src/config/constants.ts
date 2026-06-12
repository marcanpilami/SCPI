import type { LoanScenario, SimulationInput } from '../types/simulation'

export const MONTHS_IN_YEAR = 12
export const SOCIAL_CONTRIBUTIONS_RATE = 0.186

export const INPUT_LIMITS = {
  downPaymentAmount: { min: 0, max: 10000000 },
  loanDurationYears: { min: 1, max: 30 },
  loanAnnualRate: { min: 0, max: 0.15 },
  loanAnnualInsuranceRate: { min: 0, max: 0.03 },
  otherInitialExpenses: { min: 0, max: 1000000 },
  enjoymentDelayMonths: { min: 0, max: 24 },
  distributionRate: { min: 0, max: 0.15 },
  subscriptionFeeRate: { min: 0, max: 0.25 },
  investmentAmount: { min: 1000, max: 10000000 },
  taxBracketRate: { min: 0, max: 0.45 },
  revenueInFranceRate: { min: 0, max: 1 },
  foreignTaxRate: { min: 0, max: 1 },
  annualRevaluationRate: { min: -0.05, max: 0.08 },
  horizonYears: { min: 1, max: 40 },
} as const

export const DEFAULT_SIMULATION_INPUT: SimulationInput = {
  useLoan: true,
  downPaymentAmount: 50000,
  loanDurationYears: 20,
  loanAnnualRate: 0.040,
  loanAnnualInsuranceRate: 0.0006,
  otherInitialExpenses: 5110,
  enjoymentDelayMonths: 6,
  distributionRate: 0.060,
  subscriptionFeeRate: 0.1,
  investmentAmount: 200000,
  taxBracketRate: 0.41,
  revenueInFranceRate: 0.179,
  foreignTaxRate: 0.20,
  annualRevaluationRate: 0.003,
  horizonYears: 30,
}

export const DEFAULT_LOAN_SCENARIOS: LoanScenario[] = [
  {
    id: 'scenario-base',
    name: 'Base',
    downPaymentAmount: DEFAULT_SIMULATION_INPUT.downPaymentAmount,
    loanDurationYears: DEFAULT_SIMULATION_INPUT.loanDurationYears,
    loanAnnualRate: DEFAULT_SIMULATION_INPUT.loanAnnualRate,
    loanAnnualInsuranceRate: DEFAULT_SIMULATION_INPUT.loanAnnualInsuranceRate,
  },
  {
    id: 'scenario-court',
    name: 'Court',
    downPaymentAmount: 45000,
    loanDurationYears: 15,
    loanAnnualRate: 0.035,
    loanAnnualInsuranceRate: 0.0015,
  },
  {
    id: 'scenario-long',
    name: 'Long',
    downPaymentAmount: 20000,
    loanDurationYears: 25,
    loanAnnualRate: 0.042,
    loanAnnualInsuranceRate: 0.003,
  },
]
