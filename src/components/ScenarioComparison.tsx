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

export function ScenarioComparison({
  scenarios,
  outputs,
  onAddFromCurrent,
  onUpdateScenario,
  onRemoveScenario,
}: ScenarioComparisonProps) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Comparaison de plusieurs scenarios avec emprunt</h2>
          <p className="panel-subtitle">
            Tous les scenarios ci-dessous utilisent un prêt et partagent les autres
            parametres du formulaire principal.
          </p>
        </div>
        <button type="button" className="btn" onClick={onAddFromCurrent}>
          Ajouter le scenario courant
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
              <th>Scenario</th>
              <th>Apport</th>
              <th>Duree</th>
              <th>Taux prêt</th>
              <th>Taux assurance</th>
              <th>Effort total consenti</th>
              <th>Valeur finale</th>
              <th>Resultat final</th>
            </tr>
          </thead>
          <tbody>
            {outputs.map(({ scenario, output }) => (
              <tr key={`${scenario.id}-result`}>
                <td>{scenario.name || 'Sans nom'}</td>
                <td>{formatEuro(scenario.downPaymentAmount)}</td>
                <td>{scenario.loanDurationYears} ans</td>
                <td>{formatPercent(scenario.loanAnnualRate)}</td>
                <td>{formatPercent(scenario.loanAnnualInsuranceRate)}</td>
                <td>{formatEuro(output.summary.totalOutOfPocket)}</td>
                <td>{formatEuro(output.summary.finalAssetValue)}</td>
                <td
                  className={
                    output.summary.finalProfitLoss >= 0 ? 'positive' : 'negative'
                  }
                >
                  {formatEuro(output.summary.finalProfitLoss)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
