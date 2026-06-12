export interface SimulationInput {
  useLoan: boolean
  downPaymentAmount: number
  loanDurationYears: number
  loanAnnualRate: number
  loanAnnualInsuranceRate: number
  otherInitialExpenses: number
  enjoymentDelayMonths: number
  distributionRate: number
  subscriptionFeeRate: number
  investmentAmount: number
  taxBracketRate: number
  revenueInFranceRate: number
  foreignTaxRate: number
  annualRevaluationRate: number
  horizonYears: number
}

export interface LoanScenario {
  id: string
  name: string
  downPaymentAmount: number
  loanDurationYears: number
  loanAnnualRate: number
  loanAnnualInsuranceRate: number
}

export interface LoanYearlyBreakdown {
  year: number
  capitalPaid: number
  interestPaid: number
  insurancePaid: number
  remainingCapital: number
}

export interface YearlyResult {
  year: number;
  grossRents: number;
  annualYield: number;
  taxableIncomeInFrance: number;
  taxableIncomeAbroad: number;
  taxesPaidInFrance: number;
  taxesPaidAbroad: number;
  bankCapitalRepaid: number;
  bankInterestPaid: number;
  bankReimbursementTotal: number;
  loanInsurancePaid: number;
  loanRemainingCapital: number;
  taxesPaid: number;
  effortAmount: number;
  assetValueEnd: number;
  globalProfitLoss: number;
  cumulativeOutOfPocket: number;
  cumulativeProfit: number;
}

export interface SimulationSummary {
  initialAssetValue: number
  totalBorrowedAmount: number
  totalFees: number
  annualIncomeAfterLoan: number
  totalRents: number
  totalBankReimbursement: number
  totalTaxes: number
  totalEffort: number
  totalOutOfPocket: number
  finalAssetValue: number
  finalProfitLoss: number
  leverageRatio: number
}

export interface SimulationOutput {
  yearlyResults: YearlyResult[]
  summary: SimulationSummary
}
