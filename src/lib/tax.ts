import { FRENCH_TAX_BRACKETS } from "../config/constants";
import type { TaxBracketResult, TaxResult } from "../types/simulation";

export function taxSimulation(taxable_income: number): TaxResult {
    let total_tax = 0;
    let previous_limit = 0;

    const brackets: TaxBracketResult[] = [];

    for (const bracket of FRENCH_TAX_BRACKETS) {
      if (taxable_income <= previous_limit) break;

      const taxable_in_bracket = Math.min(taxable_income, bracket.threshold) - previous_limit;
      total_tax += taxable_in_bracket * bracket.rate;
      brackets.push({
        bracketRate: bracket.rate,
        incomeInBracket: taxable_in_bracket,
        taxesPaidInBracket: taxable_in_bracket * bracket.rate,
      });
      previous_limit = bracket.threshold;
    }

    return {
      averageTaxRate: taxable_income > 0 ? total_tax / taxable_income : 0,
      totalTaxesPaid: total_tax,
      brackets,
      marginalRate: Math.max(...brackets.map(b => b.bracketRate), 0),
    };
}
