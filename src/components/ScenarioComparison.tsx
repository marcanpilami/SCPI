import { INPUT_LIMITS } from '../config/constants'
import { formatEuro, formatPercent } from '../lib/format'
import type { LoanScenario, SimulationOutput } from '../types/simulation'

interface ScenarioComparisonProps {
  scenarios: LoanScenario[]
  outputs: Array<{ scenario: LoanScenario; output: SimulationOutput }>
  onAddFromCurrent: () => void
  onUpdateScenario: (id: string, patch: Partial<LoanScenario>) => void
  onRemoveScenario: (id: string) => void
}

type ScenarioOutputEntry = { scenario: LoanScenario; output: SimulationOutput }

interface ComparisonRow {
  key: string
  label: string
  subtitle?: string
  getValue: (entry: ScenarioOutputEntry) => number
  formatValue: (value: number) => string
  showRank?: boolean
  rankReverse?: boolean
  colorBySign?: boolean
}

function asPercent(value: number): number {
  return value * 100
}

function fromPercent(value: number): number {
  return value / 100
}

function getRankBadge(rank: number): string {
  return `${rank}`
}

function computeRowRanks(
  outputs: ScenarioOutputEntry[],
  getValue: (entry: ScenarioOutputEntry) => number,
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

function ComparisonTableRow({
  row,
  outputs,
}: {
  row: ComparisonRow
  outputs: ScenarioOutputEntry[]
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
                  className={`rank-badge ${
                    (rowRanks.get(scenarioOutput.scenario.id) ?? 0) === 1
                      ? 'rank-badge-first'
                      : ''
                  }`}
                  title="Rang"
                >
                  {getRankBadge(rowRanks.get(scenarioOutput.scenario.id) ?? 0)}
                </span>
              )}
            </span>
          </td>
        )
      })}
    </tr>
  )
}

export function ScenarioComparison({
  scenarios,
  outputs,
  onAddFromCurrent,
  onUpdateScenario,
  onRemoveScenario,
}: ScenarioComparisonProps) {
  const simulatedYears = outputs[0]?.output.yearlyResults.length
  const simulatedYearsLabel = simulatedYears ?? '-'

  const rows: ComparisonRow[] = [
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
      subtitle: `Cumul sur ${simulatedYearsLabel} ans`,
      getValue: (entry) => entry.output.summary.totalTaxes,
      formatValue: formatEuro,
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
      label: 'Rendement net d\'impôts',
      subtitle: `année ${simulatedYearsLabel}, sans plus-values latentes`,
      getValue: (entry) => entry.output.summary.yieldAtEndOfSimulation,
      formatValue: formatPercent,
      showRank: true,
    },
    {
      key: 'overallYearlyYield',
      label: 'Rendement net d\'impôts',
      subtitle: `moyen sur ${simulatedYearsLabel} ans, sans plus-values latentes`,
      getValue: (entry) => entry.output.summary.overallYearlyYield,
      formatValue: formatPercent,
      showRank: true,
    },
    {
      key: 'overallYearlyYieldWithLatentGains',
      label: 'Rendement net d\'impôts',
      subtitle: `moyen sur ${simulatedYearsLabel} ans, avec plus-values latentes`,
      getValue: (entry) => entry.output.summary.overallYearlyYieldWithLatentGains,
      formatValue: formatPercent,
      showRank: true,
    },    
    {
      key: 'finalCashValue',
      label: 'Loyers net d\'impôts reçus au total',
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
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Comparaison de plusieurs scénarios d'emprunt</h2>
          <p className="panel-subtitle">
            Tous les scénarios ci-dessous diffèrent par les caractéristiques de leur prêt et partagent les autres
            paramètres du formulaire principal.
          </p>
        </div>
        <button type="button" className="btn" onClick={onAddFromCurrent}>
          + Nouveau scénario
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Indicateur</th>
              {outputs.map((scenarioOutput) => (
                <th key={`${scenarioOutput.scenario.id}-header`}>
                  <div className="scenario-header-cell">
                    {scenarioOutput.scenario.editable ? (
                      <input
                        className="scenario-cell-input scenario-header-name-input"
                        type="text"
                        value={scenarioOutput.scenario.name}
                        onChange={(event) =>
                          onUpdateScenario(scenarioOutput.scenario.id, {
                            name: event.target.value,
                          })
                        }
                      />
                    ) : (
                      <span>{scenarioOutput.scenario.name || 'Sans nom'}</span>
                    )}
                    {scenarioOutput.scenario.editable && (
                      <button
                        type="button"
                        className="table-delete-icon-btn"
                        onClick={() => onRemoveScenario(scenarioOutput.scenario.id)}
                        disabled={scenarios.length <= 1}
                        title="Supprimer ce scénario"
                        aria-label="Supprimer ce scénario"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Apport (EUR)</td>
              {outputs.map((scenarioOutput) => (
                <td key={`down-payment-${scenarioOutput.scenario.id}`}>
                  {scenarioOutput.scenario.editable ? (
                    <input
                      className="scenario-cell-input"
                      type="number"
                      min={INPUT_LIMITS.downPaymentAmount.min}
                      max={INPUT_LIMITS.downPaymentAmount.max}
                      step={500}
                      value={scenarioOutput.scenario.downPaymentAmount}
                      onChange={(event) =>
                        onUpdateScenario(scenarioOutput.scenario.id, {
                          downPaymentAmount: Number(event.target.value),
                        })
                      }
                    />
                  ) : (
                    <span>{formatEuro(scenarioOutput.scenario.downPaymentAmount)}</span>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td>Durée (ans)</td>
              {outputs.map((scenarioOutput) => (
                <td key={`duration-${scenarioOutput.scenario.id}`}>
                  {scenarioOutput.scenario.editable ? (
                    <input
                      className="scenario-cell-input"
                      type="number"
                      min={INPUT_LIMITS.loanDurationYears.min}
                      max={INPUT_LIMITS.loanDurationYears.max}
                      value={scenarioOutput.scenario.loanDurationYears}
                      onChange={(event) =>
                        onUpdateScenario(scenarioOutput.scenario.id, {
                          loanDurationYears: Number(event.target.value),
                        })
                      }
                    />
                  ) : (
                    <span>{`${scenarioOutput.scenario.loanDurationYears} ans`}</span>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td>Taux prêt (%)</td>
              {outputs.map((scenarioOutput) => (
                <td key={`loan-rate-${scenarioOutput.scenario.id}`}>
                  {scenarioOutput.scenario.editable ? (
                    <input
                      className="scenario-cell-input"
                      type="number"
                      min={INPUT_LIMITS.loanAnnualRate.min * 100}
                      max={INPUT_LIMITS.loanAnnualRate.max * 100}
                      step={0.01}
                      value={asPercent(scenarioOutput.scenario.loanAnnualRate)}
                      onChange={(event) =>
                        onUpdateScenario(scenarioOutput.scenario.id, {
                          loanAnnualRate: fromPercent(Number(event.target.value)),
                        })
                      }
                    />
                  ) : (
                    <span>{formatPercent(scenarioOutput.scenario.loanAnnualRate)}</span>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td>Taux assurance (%)</td>
              {outputs.map((scenarioOutput) => (
                <td key={`insurance-rate-${scenarioOutput.scenario.id}`}>
                  {scenarioOutput.scenario.editable ? (
                    <input
                      className="scenario-cell-input"
                      type="number"
                      min={INPUT_LIMITS.loanAnnualInsuranceRate.min * 100}
                      max={INPUT_LIMITS.loanAnnualInsuranceRate.max * 100}
                      step={0.01}
                      value={asPercent(scenarioOutput.scenario.loanAnnualInsuranceRate)}
                      onChange={(event) =>
                        onUpdateScenario(scenarioOutput.scenario.id, {
                          loanAnnualInsuranceRate: fromPercent(
                            Number(event.target.value),
                          ),
                        })
                      }
                    />
                  ) : (
                    <span>
                      {formatPercent(scenarioOutput.scenario.loanAnnualInsuranceRate)}
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {rows.map((row) => (
              <ComparisonTableRow key={row.key} row={row} outputs={outputs} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
