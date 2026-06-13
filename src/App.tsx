import { useEffect, useMemo, useState } from 'react'
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
import type { LoanScenario, SimulationInput } from './types/simulation'

const STORAGE_KEY_SIMULATION_INPUT = 'scpi:simulation-input'
const STORAGE_KEY_LOAN_SCENARIOS = 'scpi:loan-scenarios'

function readPersistedSimulationInput(): SimulationInput {
  if (typeof window === 'undefined') {
    return DEFAULT_SIMULATION_INPUT
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_SIMULATION_INPUT)
    if (!raw) {
      return DEFAULT_SIMULATION_INPUT
    }

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_SIMULATION_INPUT
    }

    return {
      ...DEFAULT_SIMULATION_INPUT,
      ...(parsed as Partial<SimulationInput>),
    }
  } catch {
    return DEFAULT_SIMULATION_INPUT
  }
}

function readPersistedLoanScenarios(): LoanScenario[] {
  if (typeof window === 'undefined') {
    return DEFAULT_LOAN_SCENARIOS
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_LOAN_SCENARIOS)
    if (!raw) {
      return DEFAULT_LOAN_SCENARIOS
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_LOAN_SCENARIOS
    }

    return parsed as LoanScenario[]
  } catch {
    return DEFAULT_LOAN_SCENARIOS
  }
}

function App() {
  const [input, setInput] = useState<SimulationInput>(() =>
    readPersistedSimulationInput(),
  )
  const [showDetailed, setShowDetailed] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true)
  const [loanScenarios, setLoanScenarios] = useState<LoanScenario[]>(() =>
    readPersistedLoanScenarios(),
  )

  const withLoanSimulation = useMemo(
    () => simulateScpiInvestment({ ...input, useLoan: true }),
    [input],
  )
  const withoutLoanSimulation = useMemo(
    () => simulateScpiInvestment({ ...input, useLoan: false }),
    [input],
  )
  const simulation = useMemo(
    () => (input.useLoan ? withLoanSimulation : withoutLoanSimulation),
    [input.useLoan, withLoanSimulation, withoutLoanSimulation],
  )

  const scenarioOutputs = useMemo(
    () => [
      {
        scenario: {
          id: 'scenario-main',
          name: 'Scénario principal',
          editable: false,
          downPaymentAmount: input.downPaymentAmount,
          loanDurationYears: input.loanDurationYears,
          loanAnnualRate: input.loanAnnualRate,
          loanAnnualInsuranceRate: input.loanAnnualInsuranceRate,
        },
        output: simulation,
      },
      {
        scenario: {
          id: 'scenario-no-loan',
          name: 'Sans prêt',
          editable: false,
          downPaymentAmount: input.investmentAmount,
          loanDurationYears: 0,
          loanAnnualRate: 0,
          loanAnnualInsuranceRate: 0,
        },
        output: withoutLoanSimulation,
      },
      ...loanScenarios.map((scenario) => ({
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
     
    ],
    [input, loanScenarios, simulation, withoutLoanSimulation],
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_SIMULATION_INPUT, JSON.stringify(input))
    } catch {
      // Ignore persistence issues (private mode/quota), app remains functional.
    }
  }, [input])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_LOAN_SCENARIOS, JSON.stringify(loanScenarios))
    } catch {
      // Ignore persistence issues
    }
  }, [loanScenarios])

  function handleExportCsv(): void {
    const csv = buildYearlyResultsCsv(simulation.yearlyResults)
    downloadCsv(csv, 'projection-scpi.csv')
  }

  function handleAddNewScenario(): void {
    const nextIndex = loanScenarios.length + 1
    setLoanScenarios((current) => [
      ...current,
      {
        id: `scenario-${Date.now()}-${nextIndex}`,
        name: `Scénario ${nextIndex}`,
        editable: true,
        downPaymentAmount: DEFAULT_SIMULATION_INPUT.downPaymentAmount,
        loanDurationYears: DEFAULT_SIMULATION_INPUT.loanDurationYears,
        loanAnnualRate: DEFAULT_SIMULATION_INPUT.loanAnnualRate,
        loanAnnualInsuranceRate: DEFAULT_SIMULATION_INPUT.loanAnnualInsuranceRate,
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
    setLoanScenarios((current) =>
      current.filter((scenario) => !(scenario.id === id && scenario.editable)),
    )
  }

  function handleResetInput(): void {
    setInput(DEFAULT_SIMULATION_INPUT)
    setLoanScenarios(DEFAULT_LOAN_SCENARIOS)
    try {
      window.localStorage.removeItem(STORAGE_KEY_SIMULATION_INPUT)
      window.localStorage.removeItem(STORAGE_KEY_LOAN_SCENARIOS)
    } catch {
      // Ignore persistence issues
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="kicker">Simulateur</p>
        <h1>Rentabilité d&apos;un investissement SCPI</h1>
        <p className="hero-text">
          Projection annuelle incluant remboursement bancaire, mélange de SCPI françaises et européennes, effort d&apos;épargne, fiscalité, valorisation des actifs et résultat global.
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

      {showPrivacyNotice && (
        <div className="privacy-notice" role="note">
          <div className="privacy-notice-body">
            <strong>Sécurité de vos données</strong>
            <p>
              Les calculs sont effectués entièrement dans votre navigateur. Aucune donnée n'est envoyée 
              à un serveur : vos paramètres et résultats restent localement sur votre appareil.
            </p>
          </div>
          <button
            type="button"
            className="privacy-notice-close"
            aria-label="Fermer la notice de sécurité"
            onClick={() => setShowPrivacyNotice(false)}
          >
            ✕
          </button>
        </div>
      )}

      <SimulationForm input={input} onChange={setInput} onReset={handleResetInput} />
      <SimulationSummary summary={simulation.summary} />
      <ProjectionChart rows={simulation.yearlyResults} />
      <ScenarioComparison
        scenarios={loanScenarios}
        outputs={scenarioOutputs}
        onAddFromCurrent={handleAddNewScenario}
        onUpdateScenario={handleUpdateScenario}
        onRemoveScenario={handleRemoveScenario}
      />
      <YearlyResultsTable
        rows={simulation.yearlyResults}
        showDetailed={showDetailed}
        onToggleDetailed={setShowDetailed}
        onExportCsv={handleExportCsv}
      />
      <LoanModeComparison
        withLoan={withLoanSimulation}
        withoutLoan={withoutLoanSimulation}
      />
    </main>
  )
}

export default App
