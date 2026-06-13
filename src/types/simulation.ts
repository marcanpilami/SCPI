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
  editable: boolean
  downPaymentAmount: number
  loanDurationYears: number
  loanAnnualRate: number
  loanAnnualInsuranceRate: number
}

export interface ScpiDatabaseEntry {
  id: string
  name: string
  organization: string
  enjoymentDelayMonths: number
  subscriptionFeeRate: number
  managementFeeRate: number
  distributionFrequency: string
  franceShareRate: number
  sharePurchasePrice: number
  distributionRate: number
  pgaRate: number
  irr10Years: number
  creationYear: number
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
  endOfYearFixedAssetsValuation: number;
  endOfYearCashValuation: number;
  endOfYearValuation: number;
  endOfyearCapital: number;
  endofYearLatentProfit: number;
}

export interface SimulationSummary {
  initialAssetValue: number;
  totalBorrowedAmount: number;
  totalFees: number;
  annualIncomeAfterLoan: number;
  yieldAtEndOfSimulation: number;
  totalRents: number;
  totalBankReimbursement: number;
  totalTaxes: number;
  totalOutOfPocket: number;
  finalFixedAssetsValue: number;
  finalCashValue: number;
  finalValuation: number;
  finalLatentProfit: number;
  finalCapitalLatentGain: number;
  overallYearlyYield: number;
  overallYearlyYieldWithLatentGains: number;
  leverageRatio: number;
}

export interface SimulationOutput {
  yearlyResults: YearlyResult[]
  summary: SimulationSummary
}
