import { formatEuro, formatPercent } from '../lib/format'
import type { SimulationOutput, SimulationSummary } from '../types/simulation'

interface LoanModeComparisonProps {
  withLoan: SimulationOutput
  withoutLoan: SimulationOutput
}

interface ComparisonLineProps {
  label: string
  withLoan: SimulationOutput
  withoutLoan: SimulationOutput
  fieldName: keyof SimulationSummary
  lowerIsBetter?: boolean
  formatMethod?: (value: number) => string
  subtitle?: string
  hoverText?: string
}

function ComparisonLine({
  label,
  withLoan,
  withoutLoan,
  fieldName,
  lowerIsBetter = false,
  formatMethod = formatEuro,
  subtitle,
  hoverText,
}: ComparisonLineProps) {
  const withLoanValue = withLoan.summary[fieldName]
  const withoutLoanValue = withoutLoan.summary[fieldName]

  if (typeof withLoanValue !== 'number' || typeof withoutLoanValue !== 'number') {
    return null
  }

  const withLoanWins = lowerIsBetter
    ? withLoanValue < withoutLoanValue
    : withLoanValue > withoutLoanValue
  const withoutLoanWins = lowerIsBetter
    ? withoutLoanValue < withLoanValue
    : withoutLoanValue > withLoanValue

  return (
    <tr>
      <td>
        <span>{label}</span>
        {subtitle && <span className="subcell">{subtitle}</span>}
        {hoverText && (
          <span className="comparison-help" title={hoverText} aria-label={hoverText}>
            i
          </span>
        )}
      </td>
      <td>
        {formatMethod(withLoanValue)}
        {withLoanWins && <span className="winner-mark">gagnant</span>}
      </td>
      <td>
        {formatMethod(withoutLoanValue)}
        {withoutLoanWins && <span className="winner-mark">gagnant</span>}
      </td>
    </tr>
  )
}

export function LoanModeComparison({
  withLoan,
  withoutLoan,
}: LoanModeComparisonProps) {
    const simulatedYears = withLoan.yearlyResults.length
  return (
    <section className="panel">
      <h2>Comparaison avec prêt vs sans prêt</h2>
      <p className="panel-subtitle">
        Même investissement SCPI, seule la modalité de financement change.
      </p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Indicateur</th>
              <th>Avec prêt</th>
              <th>Sans prêt</th>
            </tr>
          </thead>
          <tbody>
            <ComparisonLine
              label="Effort total consenti"
              withLoan={withLoan}
              withoutLoan={withoutLoan}
              fieldName="totalOutOfPocket"
              lowerIsBetter
            />
            <ComparisonLine
              label="Impôts totaux"
              withLoan={withLoan}
              withoutLoan={withoutLoan}
              fieldName="totalTaxes"
              lowerIsBetter
            />
            <ComparisonLine
              label="Valeur finale des parts"
              withLoan={withLoan}
              withoutLoan={withoutLoan}
              fieldName="finalFixedAssetsValue"
            />
            <ComparisonLine
              label="Rendement annuel net d'impôts à la fin de la simulation"
              withLoan={withLoan}
              withoutLoan={withoutLoan}
              fieldName="yieldAtEndOfSimulation"
              formatMethod={formatPercent}
            />
            <ComparisonLine
                label="Rendement moyen sur toute la durée de simulation"
                subtitle="sans tenir compte des plus values latentes"
                withLoan={withLoan}
                withoutLoan={withoutLoan}
                fieldName="overallYearlyYield"
                formatMethod={formatPercent}
            />
            <ComparisonLine
                label="Rendement moyen sur toute la durée de simulation"
                subtitle="en tenant compte des plus values latentes"
                withLoan={withLoan}
                withoutLoan={withoutLoan}
                fieldName="overallYearlyYieldWithLatentGains"
                formatMethod={formatPercent}
            />
            <ComparisonLine
              label={`Loyers net d'impôts reçus au total après ${simulatedYears} ans`}
              withLoan={withLoan}
              withoutLoan={withoutLoan}
              fieldName="finalCashValue"
            />
            <ComparisonLine
              label={`Plus value latente après ${simulatedYears} ans`}
              withLoan={withLoan}
              withoutLoan={withoutLoan}
              fieldName="finalCapitalLatentGain"
            />
            <ComparisonLine
              label={`Profit total cumulé à la fin de la simulation après ${simulatedYears} ans`}
              withLoan={withLoan}
              withoutLoan={withoutLoan}
              fieldName="finalLatentProfit"
            />
          </tbody>
        </table>
      </div>
    </section>
  )
}
