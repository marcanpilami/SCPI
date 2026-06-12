import { useMemo, useState } from 'react'
import { LoanModeComparison } from './components/LoanModeComparison'
import { ScenarioComparison } from './components/ScenarioComparison'
import { ProjectionChart } from './components/ProjectionChart'
import { SimulationForm } from './components/SimulationForm'
import { SimulationSummary } from './components/SimulationSummary'
import { YearlyResultsTable } from './components/YearlyResultsTable'
import {
  DEFAULT_LOAN_SCENARIOS,
  DEFAULT_SIMULATION_INPUT,
} from './config/constants'
import { buildYearlyResultsCsv, downloadCsv } from './lib/csv'
import { simulateScpiInvestment } from './lib/scpiSimulation'
import type { LoanScenario } from './types/simulation'

function App() {
  const [input, setInput] = useState(DEFAULT_SIMULATION_INPUT)
  const [showDetailed, setShowDetailed] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [loanScenarios, setLoanScenarios] = useState<LoanScenario[]>(
    DEFAULT_LOAN_SCENARIOS,
  )

  const simulation = useMemo(() => simulateScpiInvestment(input), [input])
  const withLoanSimulation = useMemo(
    () => simulateScpiInvestment({ ...input, useLoan: true }),
    [input],
  )
  const withoutLoanSimulation = useMemo(
    () => simulateScpiInvestment({ ...input, useLoan: false }),
    [input],
  )

  const scenarioOutputs = useMemo(
    () =>
      loanScenarios.map((scenario) => ({
        scenario,
        output: simulateScpiInvestment({
          ...input,
          useLoan: true,
          downPaymentAmount: scenario.downPaymentAmount,
          loanDurationYears: scenario.loanDurationYears,
          loanAnnualRate: scenario.loanAnnualRate,
          loanAnnualInsuranceRate: scenario.loanAnnualInsuranceRate,
        }),
      })),
    [input, loanScenarios],
  )

  function handleExportCsv(): void {
    const csv = buildYearlyResultsCsv(simulation.yearlyResults)
    downloadCsv(csv, 'projection-scpi.csv')
  }

  function handleAddScenarioFromCurrent(): void {
    const nextIndex = loanScenarios.length + 1
    setLoanScenarios((current) => [
      ...current,
      {
        id: `scenario-${Date.now()}-${nextIndex}`,
        name: `Scenario ${nextIndex}`,
        downPaymentAmount: input.downPaymentAmount,
        loanDurationYears: input.loanDurationYears,
        loanAnnualRate: input.loanAnnualRate,
        loanAnnualInsuranceRate: input.loanAnnualInsuranceRate,
      },
    ])
  }

  function handleUpdateScenario(id: string, patch: Partial<LoanScenario>): void {
    setLoanScenarios((current) =>
      current.map((scenario) =>
        scenario.id === id ? { ...scenario, ...patch } : scenario,
      ),
    )
  }

  function handleRemoveScenario(id: string): void {
    setLoanScenarios((current) => current.filter((scenario) => scenario.id !== id))
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="kicker">Simulateur</p>
        <h1>Rentabilité d&apos;un investissement SCPI en France</h1>
        <p className="hero-text">
          Projection annuelle incluant remboursement bancaire, effort d&apos;épargne, fiscalité, valorisation des actifs et résultat global.
        </p>
      </header>

      {showDisclaimer && (
        <div className="disclaimer" role="note">
          <div className="disclaimer-body">
            <strong>Avertissement</strong>
            <ul>
              <li>
                Cet outil est un <strong>simulateur indicatif</strong> à but éducatif. Il ne
                constitue en aucun cas un conseil en investissement, une recommandation
                financière, fiscale ou juridique.
              </li>
              <li>
                Les projections sont basées sur des hypothèses paramétrables et des
                simplifications. Les performances passées ne préjugent pas des performances
                futures ; la valeur des parts de SCPI peut fluctuer à la hausse comme à la
                baisse.
              </li>
              <li>
                Les revenus, dividendes et plus-values sont soumis à la fiscalité en vigueur,
                susceptible d&apos;évoluer. Consultez un conseiller fiscal ou en gestion de
                patrimoine avant toute décision d&apos;investissement.
              </li>
              <li>
                L&apos;investissement en SCPI présente des risques, notamment de perte en
                capital, d&apos;illiquidité et de variation des revenus distribués.
              </li>
              <li>
                L'inflation n'est pas considérée dans les calculs, et les montants sont exprimés en euros constants. L'inflation peut affecter très fortement les calculs de rentabilité sur plusieurs décennies, et peut varier significativement d'une période à l'autre.
              </li>
            </ul>
          </div>
          <button
            type="button"
            className="disclaimer-close"
            aria-label="Fermer l'avertissement"
            onClick={() => setShowDisclaimer(false)}
          >
            ✕
          </button>
        </div>
      )}

      <SimulationForm input={input} onChange={setInput} />
      <SimulationSummary summary={simulation.summary} />
      <LoanModeComparison
        withLoan={withLoanSimulation}
        withoutLoan={withoutLoanSimulation}
      />
      <ScenarioComparison
        scenarios={loanScenarios}
        outputs={scenarioOutputs}
        onAddFromCurrent={handleAddScenarioFromCurrent}
        onUpdateScenario={handleUpdateScenario}
        onRemoveScenario={handleRemoveScenario}
      />
      <ProjectionChart rows={simulation.yearlyResults} />
      <YearlyResultsTable
        rows={simulation.yearlyResults}
        showDetailed={showDetailed}
        onToggleDetailed={setShowDetailed}
        onExportCsv={handleExportCsv}
      />
    </main>
  )
}

export default App
