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
  revenueInFranceRate: number
  foreignTaxRate: number
  annualRevaluationRate: number
  horizonYears: number
  nonScpiRevenues: number
  nonScpiTaxDeductions: number
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

export interface ScpiParameterScenario {
  id: string
  name: string
  editable: boolean
  subscriptionFeeRate: number
  distributionRate: number
  revenueInFranceRate: number
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
  grossRentsInFrance: number;
  grossRentsAbroad: number;
  annualYield: number;
  fiscalLandRevenueInFrance: number;
  fiscalLandRevenueAbroad: number;
  landDeficitInFrance: number;
  landDeficitUsedInFrance: number;
  scpiTaxesPaidAbroad: number;
  bankCapitalRepaid: number;
  bankInterestPaid: number;
  bankInterestPaidInFrance: number;
  bankInterestPaidAbroad: number;
  loanInsurancePaidInFrance: number;
  loanInsurancePaidAbroad: number;
  bankReimbursementTotal: number;
  loanInsurancePaid: number;
  loanRemainingCapital: number;
  scpiTaxesPaid: number;
  scpiAverageTaxRate: number;
  effortAmount: number;
  endOfYearFixedAssetsValuation: number;
  endOfYearCashValuation: number;
  endOfYearValuation: number;
  endOfyearCapital: number;
  endofYearLatentProfit: number;
  nonScpiTaxableIncome: number;
  nonScpiTaxableIncomeDeductions: number;
  worldGrossIncome: number;
  worldTaxableIncome: number;
  worldAverageTaxRate: number;
  theoreticalTaxesOnWorldInFrance: number;
  allIncomeTaxesPaidInFrance: number;
  socialContributionsFrance: number;
  frenchTaxCreditToRemoveDoubleTaxes: number;
  scpiFullFrenchScenarioTotalTaxes: number;
  scpiFullFrenchScenarioFiscalImpact: number;
  scpiFullFrenchScenarioAverageTaxRate: number;
  scpiFullFrenchScenarioAverageScpiTaxRate: number;
  yearlyTotalTaxesPaid: number;
  franceTheoreticalAverageIncomeTaxRate: number;
  franceAverageIncomeTaxRate: number;
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

export interface TaxResult {
  averageTaxRate: number;
  totalTaxesPaid: number;
  brackets: TaxBracketResult[];
}

export interface TaxBracketResult {
  bracketRate: number;
  incomeInBracket: number;
  taxesPaidInBracket: number;
}