import { INPUT_LIMITS } from '../config/constants'
import { formatPercent } from '../lib/format'
import { SummaryComparisonRows } from './SummaryComparisonRows'
import type { ScpiParameterScenario, SimulationOutput } from '../types/simulation'

interface ScpiParameterComparisonProps {
  scenarios: ScpiParameterScenario[]
  outputs: Array<{ scenario: ScpiParameterScenario; output: SimulationOutput }>
  onAddFromCurrent: () => void
  onUpdateScenario: (id: string, patch: Partial<ScpiParameterScenario>) => void
  onRemoveScenario: (id: string) => void
}

function asPercent(value: number): number {
  return value * 100
}

function fromPercent(value: number): number {
  return value / 100
}

export function ScpiParameterComparison({
  scenarios,
  outputs,
  onAddFromCurrent,
  onUpdateScenario,
  onRemoveScenario,
}: ScpiParameterComparisonProps) {
  const simulatedYears = outputs[0]?.output.yearlyResults.length
  const simulatedYearsLabel = simulatedYears ?? '-'

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Comparaison de scénarios SCPI (prêt constant)</h2>
          <p className="panel-subtitle">
            Le prêt reste identique au scénario principal. Seuls les frais de souscription, le taux de distribution et la part de revenus en France changent.
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
              <td>Frais de souscription (%)</td>
              {outputs.map((scenarioOutput) => (
                <td key={`subscription-fee-${scenarioOutput.scenario.id}`}>
                  {scenarioOutput.scenario.editable ? (
                    <input
                      className="scenario-cell-input"
                      type="number"
                      min={INPUT_LIMITS.subscriptionFeeRate.min * 100}
                      max={INPUT_LIMITS.subscriptionFeeRate.max * 100}
                      step={0.01}
                      value={asPercent(scenarioOutput.scenario.subscriptionFeeRate)}
                      onChange={(event) =>
                        onUpdateScenario(scenarioOutput.scenario.id, {
                          subscriptionFeeRate: fromPercent(Number(event.target.value)),
                        })
                      }
                    />
                  ) : (
                    <span>{formatPercent(scenarioOutput.scenario.subscriptionFeeRate)}</span>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td>Taux de distribution (%)</td>
              {outputs.map((scenarioOutput) => (
                <td key={`distribution-rate-${scenarioOutput.scenario.id}`}>
                  {scenarioOutput.scenario.editable ? (
                    <input
                      className="scenario-cell-input"
                      type="number"
                      min={INPUT_LIMITS.distributionRate.min * 100}
                      max={INPUT_LIMITS.distributionRate.max * 100}
                      step={0.01}
                      value={asPercent(scenarioOutput.scenario.distributionRate)}
                      onChange={(event) =>
                        onUpdateScenario(scenarioOutput.scenario.id, {
                          distributionRate: fromPercent(Number(event.target.value)),
                        })
                      }
                    />
                  ) : (
                    <span>{formatPercent(scenarioOutput.scenario.distributionRate)}</span>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td>Revenus en France (%)</td>
              {outputs.map((scenarioOutput) => (
                <td key={`france-share-${scenarioOutput.scenario.id}`}>
                  {scenarioOutput.scenario.editable ? (
                    <input
                      className="scenario-cell-input"
                      type="number"
                      min={INPUT_LIMITS.revenueInFranceRate.min * 100}
                      max={INPUT_LIMITS.revenueInFranceRate.max * 100}
                      step={0.01}
                      value={asPercent(scenarioOutput.scenario.revenueInFranceRate)}
                      onChange={(event) =>
                        onUpdateScenario(scenarioOutput.scenario.id, {
                          revenueInFranceRate: fromPercent(Number(event.target.value)),
                        })
                      }
                    />
                  ) : (
                    <span>{formatPercent(scenarioOutput.scenario.revenueInFranceRate)}</span>
                  )}
                </td>
              ))}
            </tr>

            <SummaryComparisonRows
              outputs={outputs}
              simulatedYearsLabel={simulatedYearsLabel}
            />
          </tbody>
        </table>
      </div>
    </section>
  )
}
