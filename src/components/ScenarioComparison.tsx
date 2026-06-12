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

function asPercent(value: number): number {
  return value * 100
}

function fromPercent(value: number): number {
  return value / 100
}

function getRankBadge(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return `${rank}`
  }
}

function computeRanks<T>(items: T[], getValue: (item: T) => number): Map<T, number> {
  const sorted = [...items].sort((a, b) => getValue(b) - getValue(a))
  const ranks = new Map<T, number>()
  sorted.forEach((item, index) => {
    ranks.set(item, index + 1)
  })
  return ranks
}

export function ScenarioComparison({
  scenarios,
  outputs,
  onAddFromCurrent,
  onUpdateScenario,
  onRemoveScenario,
}: ScenarioComparisonProps) {
  const simulatedYears = outputs[0]?.output.yearlyResults.length

  const leverageRanks = computeRanks(
    outputs,
    (output) => output.output.summary.leverageRatio,
  )
  const yieldRanks = computeRanks(
    outputs,
    (output) => output.output.summary.yieldAtEndOfSimulation,
  )
  const overallYieldRanks = computeRanks(
    outputs,
    (output) => output.output.summary.overallYearlyYield,
  )
  const profitRanks = computeRanks(
    outputs,
    (output) => output.output.summary.finalLatentProfit,
  )
  const overallYieldWithLatentGainsRanks = computeRanks(  
    outputs,
    (output) => output.output.summary.overallYearlyYieldWithLatentGains,
  )

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Comparaison de plusieurs scénarios avec emprunt</h2>
          <p className="panel-subtitle">
            Tous les scénarios ci-dessous utilisent un prêt et partagent les autres
            paramètres du formulaire principal.
          </p>
        </div>
        <button type="button" className="btn" onClick={onAddFromCurrent}>
          Ajouter le scénario courant
        </button>
      </div>

      <div className="scenario-grid">
        {scenarios.map((scenario) => (
          <article key={scenario.id} className="scenario-card">
            <label>
              Nom
              <input
                type="text"
                value={scenario.name}
                onChange={(event) =>
                  onUpdateScenario(scenario.id, { name: event.target.value })
                }
              />
            </label>
            <label>
              Apport (EUR)
              <input
                type="number"
                min={INPUT_LIMITS.downPaymentAmount.min}
                max={INPUT_LIMITS.downPaymentAmount.max}
                step={500}
                value={scenario.downPaymentAmount}
                onChange={(event) =>
                  onUpdateScenario(scenario.id, {
                    downPaymentAmount: Number(event.target.value),
                  })
                }
              />
            </label>
            <label>
              Duree (ans)
              <input
                type="number"
                min={INPUT_LIMITS.loanDurationYears.min}
                max={INPUT_LIMITS.loanDurationYears.max}
                value={scenario.loanDurationYears}
                onChange={(event) =>
                  onUpdateScenario(scenario.id, {
                    loanDurationYears: Number(event.target.value),
                  })
                }
              />
            </label>
            <label>
              Taux prêt (%)
              <input
                type="number"
                min={INPUT_LIMITS.loanAnnualRate.min * 100}
                max={INPUT_LIMITS.loanAnnualRate.max * 100}
                step={0.01}
                value={asPercent(scenario.loanAnnualRate)}
                onChange={(event) =>
                  onUpdateScenario(scenario.id, {
                    loanAnnualRate: fromPercent(Number(event.target.value)),
                  })
                }
              />
            </label>
            <label>
              Taux assurance (%)
              <input
                type="number"
                min={INPUT_LIMITS.loanAnnualInsuranceRate.min * 100}
                max={INPUT_LIMITS.loanAnnualInsuranceRate.max * 100}
                step={0.01}
                value={asPercent(scenario.loanAnnualInsuranceRate)}
                onChange={(event) =>
                  onUpdateScenario(scenario.id, {
                    loanAnnualInsuranceRate: fromPercent(Number(event.target.value)),
                  })
                }
              />
            </label>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onRemoveScenario(scenario.id)}
              disabled={scenarios.length <= 1}
            >
              Supprimer
            </button>
          </article>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Scénario</th>
              <th>Apport</th>
              <th>Durée</th>
              <th>Taux prêt</th>
              <th>Taux assurance</th>
              <th>Effort total consenti</th>
              <th>Effet de levier</th>
              <th>
                Rentabilité
                <span className="subcell">année {simulatedYears}</span>
              </th>
              <th>
                Rentabilité
                <span className="subcell">moyenne sur {simulatedYears} ans</span>
              </th>
              <th>
                Rentabilité
                <span className="subcell">moyenne avec plus values latentes</span>
              </th>
              <th>Profit cumulé
                <span className="subcell">année {simulatedYears}</span>                
              </th>
            </tr>
          </thead>
          <tbody>
            {outputs.map((scenarioOutput) => (
              <tr key={`${scenarioOutput.scenario.id}-result`}>
                <td>{scenarioOutput.scenario.name || 'Sans nom'}</td>
                <td>{formatEuro(scenarioOutput.scenario.downPaymentAmount)}</td>
                <td>{scenarioOutput.scenario.loanDurationYears} ans</td>
                <td>{formatPercent(scenarioOutput.scenario.loanAnnualRate)}</td>
                <td>{formatPercent(scenarioOutput.scenario.loanAnnualInsuranceRate)}</td>
                <td>{formatEuro(scenarioOutput.output.summary.totalOutOfPocket)}</td>
                <td>
                  <span>{formatPercent(scenarioOutput.output.summary.leverageRatio)}</span>
                  <span className="rank-badge" title="Rang">
                    {getRankBadge(leverageRanks.get(scenarioOutput) ?? 0)}
                  </span>
                </td>
                <td>
                  <span>{formatPercent(scenarioOutput.output.summary.yieldAtEndOfSimulation)}</span>
                  <span className="rank-badge" title="Rang">
                    {getRankBadge(yieldRanks.get(scenarioOutput) ?? 0)}
                  </span>
                </td>
                <td>
                  <span>{formatPercent(scenarioOutput.output.summary.overallYearlyYield)}</span>
                  <span className="rank-badge" title="Rang">
                    {getRankBadge(overallYieldRanks.get(scenarioOutput) ?? 0)}
                  </span>
                </td>
                <td>
                  <span>{formatPercent(scenarioOutput.output.summary.overallYearlyYieldWithLatentGains)}</span>
                  <span className="rank-badge" title="Rang">
                    {getRankBadge(overallYieldWithLatentGainsRanks.get(scenarioOutput) ?? 0)}
                  </span>
                </td>
                <td className={scenarioOutput.output.summary.finalLatentProfit >= 0 ? 'positive' : 'negative'}>
                  <span>{formatEuro(scenarioOutput.output.summary.finalLatentProfit)}</span>
                  <span className="rank-badge" title="Rang">
                    {getRankBadge(profitRanks.get(scenarioOutput) ?? 0)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
