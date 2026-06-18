import { formatEuro, formatPercent } from '../lib/format'
import type { SimulationOutput } from '../types/simulation'

type ComparisonOutputEntry<TScenario extends { id: string }> = {
  scenario: TScenario
  output: SimulationOutput
}

interface ComparisonRow<TScenario extends { id: string }> {
  key: string
  label: string
  subtitle?: string
  getValue: (entry: ComparisonOutputEntry<TScenario>) => number
  formatValue: (value: number) => string
  showRank?: boolean
  rankReverse?: boolean
  colorBySign?: boolean
}

interface SummaryComparisonRowsProps<TScenario extends { id: string }> {
  outputs: Array<ComparisonOutputEntry<TScenario>>
  simulatedYearsLabel: string | number
}

function getRankBadge(rank: number): string {
  return `${rank}`
}

function computeRowRanks<TScenario extends { id: string }>(
  outputs: Array<ComparisonOutputEntry<TScenario>>,
  getValue: (entry: ComparisonOutputEntry<TScenario>) => number,
  rankReverse = false,
): Map<string, number> {
  const sorted = [...outputs].sort((a, b) =>
    rankReverse ? getValue(a) - getValue(b) : getValue(b) - getValue(a),
  )
  const ranks = new Map<string, number>()

  sorted.forEach((entry, index) => {
    ranks.set(entry.scenario.id, index + 1)
  })

  return ranks
}

function ComparisonTableRow<TScenario extends { id: string }>({
  row,
  outputs,
}: {
  row: ComparisonRow<TScenario>
  outputs: Array<ComparisonOutputEntry<TScenario>>
}) {
  const rowRanks = row.showRank
    ? computeRowRanks(outputs, row.getValue, row.rankReverse)
    : undefined

  return (
    <tr>
      <td>
        <span>{row.label}</span>
        {row.subtitle && <span className="subcell">{row.subtitle}</span>}
      </td>
      {outputs.map((scenarioOutput) => {
        const value = row.getValue(scenarioOutput)
        const className = row.colorBySign
          ? value < 0
            ? 'negative'
            : 'positive'
          : undefined

        return (
          <td key={`${row.key}-${scenarioOutput.scenario.id}`} className={className}>
            <span className="comparison-cell-value">
              <span>{row.formatValue(value)}</span>
              {rowRanks && (
                <span
                  className={`rank-badge ${(rowRanks.get(scenarioOutput.scenario.id) ?? 0) === 1 ? 'rank-badge-first' : ''}`}
                  title="Rang"
                >
                  {getRankBadge(rowRanks.get(scenarioOutput.scenario.id) ?? 0)}
                </span>
              )}
            </span>
          </td>
        )}
      )}
    </tr>
  )
}

export function SummaryComparisonRows<TScenario extends { id: string }>({
  outputs,
  simulatedYearsLabel,
}: SummaryComparisonRowsProps<TScenario>) {
  const rows: Array<ComparisonRow<TScenario>> = [
    {
      key: 'totalOutOfPocket',
      label: 'Effort total consenti',
      getValue: (entry) => entry.output.summary.totalOutOfPocket,
      formatValue: formatEuro,
      showRank: true,
      rankReverse: true,
    },
    {
      key: 'totalTaxes',
      label: 'Impôts payés',
      subtitle: `Cumul sur ${simulatedYearsLabel} ans, dont taxes sociales`,
      getValue: (entry) => entry.output.summary.totalTaxes,
      formatValue: formatEuro,
      showRank: true,
      rankReverse: true,
    },
    {
      key: 'overallRentTaxRate',
      label: "Taux d'imposition moyen des loyers",
      subtitle: `Moyenne sur ${simulatedYearsLabel} ans, dont taxes sociales`,
      getValue: (entry) => entry.output.summary.overallRentTaxRate,
      formatValue: formatPercent,
      showRank: true,
      rankReverse: true,
    },
    {
      key: 'leverageRatio',
      label: 'Effet de levier',
      getValue: (entry) => entry.output.summary.leverageRatio,
      formatValue: formatPercent,
      showRank: true,
    },
    {
      key: 'yieldAtEndOfSimulation',
      label: "Rendement net d'impôts",
      subtitle: `année ${simulatedYearsLabel}, sans plus-values latentes`,
      getValue: (entry) => entry.output.summary.yieldAtEndOfSimulation,
      formatValue: formatPercent,
      showRank: true,
    },
    {
      key: 'overallYearlyYield',
      label: "Rendement net d'impôts",
      subtitle: `moyen sur ${simulatedYearsLabel} ans, sans plus-values latentes`,
      getValue: (entry) => entry.output.summary.overallYearlyYield,
      formatValue: formatPercent,
      showRank: true,
    },
    {
      key: 'overallYearlyYieldWithLatentGains',
      label: "Rendement net d'impôts",
      subtitle: `moyen sur ${simulatedYearsLabel} ans, avec plus-values latentes`,
      getValue: (entry) => entry.output.summary.overallYearlyYieldWithLatentGains,
      formatValue: formatPercent,
      showRank: true,
    },
    {
      key: 'finalCashValue',
      label: "Loyers net d'impôts reçus au total",
      subtitle: `Cumul sur ${simulatedYearsLabel} ans`,
      getValue: (entry) => entry.output.summary.finalCashValue,
      formatValue: formatEuro,
      showRank: true,
      colorBySign: true,
    },
    {
      key: 'finalCapitalLatentGain',
      label: 'Plus value latente',
      subtitle: `Après ${simulatedYearsLabel} ans`,
      getValue: (entry) => entry.output.summary.finalCapitalLatentGain,
      formatValue: formatEuro,
      showRank: true,
      colorBySign: true,
    },
    {
      key: 'finalLatentProfit',
      label: 'Profit total cumulé',
      subtitle: `Si tout est vendu l'année ${simulatedYearsLabel}`,
      getValue: (entry) => entry.output.summary.finalLatentProfit,
      formatValue: formatEuro,
      showRank: true,
      colorBySign: true,
    },
  ]

  return (
    <>
      {rows.map((row) => (
        <ComparisonTableRow key={row.key} row={row} outputs={outputs} />
      ))}
    </>
  )
}
