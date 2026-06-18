import { useEffect, useMemo, useState } from 'react'
import { ScpiParameterComparison } from './components/ScpiParameterComparison'
import { ScenarioComparison } from './components/ScenarioComparison'
import { ProjectionChart } from './components/ProjectionChart'
import { SimulationForm } from './components/SimulationForm'
import { SimulationSummary } from './components/SimulationSummary'
import { YearlyResultsTable } from './components/YearlyResultsTable'
import { YearlyTaxResultTable } from './components/YearlyTaxResultTable'
import {
  DEFAULT_LOAN_SCENARIOS,
  DEFAULT_SCPI_PARAMETER_SCENARIOS,
  DEFAULT_SIMULATION_INPUT,
} from './config/constants'
import { buildYearlyResultsCsv, downloadCsv } from './lib/csv'
import { simulateScpiInvestment } from './lib/scpiSimulation'
import type {
  LoanScenario,
  ScpiParameterScenario,
  SimulationInput,
} from './types/simulation'

const STORAGE_KEY_SIMULATION_INPUT = 'scpi:simulation-input'
const STORAGE_KEY_LOAN_SCENARIOS = 'scpi:loan-scenarios'
const STORAGE_KEY_SCPI_PARAMETER_SCENARIOS = 'scpi:scpi-parameter-scenarios'

const PAGE_MENU_SECTIONS = [
  { id: 'section-form', label: 'Paramètres' },
  { id: 'section-summary', label: 'Synthèse' },
  { id: 'section-chart', label: 'Graphique' },
  { id: 'section-loan-scenarios', label: 'Scénarios emprunt' },
  { id: 'section-scpi-scenarios', label: 'Scénarios SCPI' },
  { id: 'section-yearly-results', label: 'Projection annuelle' },
  { id: 'section-yearly-tax', label: 'Projection fiscale' },
] as const

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

function readPersistedScpiParameterScenarios(): ScpiParameterScenario[] {
  if (typeof window === 'undefined') {
    return DEFAULT_SCPI_PARAMETER_SCENARIOS
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_SCPI_PARAMETER_SCENARIOS)
    if (!raw) {
      return DEFAULT_SCPI_PARAMETER_SCENARIOS
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_SCPI_PARAMETER_SCENARIOS
    }

    return parsed as ScpiParameterScenario[]
  } catch {
    return DEFAULT_SCPI_PARAMETER_SCENARIOS
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
  const [scpiParameterScenarios, setScpiParameterScenarios] = useState<
    ScpiParameterScenario[]
  >(() => readPersistedScpiParameterScenarios())

  const withLoanSimulation = useMemo(
    () => simulateScpiInvestment({ ...input, useLoan: true }),
    [input],
  )
  const withoutLoanSimulation = useMemo(
    () => simulateScpiInvestment({ ...input, useLoan: false }),
    [input],
  )
  const withoutForeignScpiSimulation = useMemo(
    () => simulateScpiInvestment({ ...input, revenueInFranceRate: 1 }),
    [input],
  )
  const withoutFranceScpiSimulation = useMemo(
    () => simulateScpiInvestment({ ...input, revenueInFranceRate: 0 }),
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

  const scpiParameterOutputs = useMemo(
    () => [
      {
        scenario: {
          id: 'scpi-main',
          name: 'Scénario principal',
          editable: false,
          subscriptionFeeRate: input.subscriptionFeeRate,
          distributionRate: input.distributionRate,
          revenueInFranceRate: input.revenueInFranceRate,
        },
        output: simulation,
      },
      {
        scenario: {
          id: 'scpi-no-europe',
          name: 'Sans SCPI étrangère',
          editable: false,
          subscriptionFeeRate: input.subscriptionFeeRate,
          distributionRate: input.distributionRate,
          revenueInFranceRate: 1,
        },
        output: withoutForeignScpiSimulation,
      },
      {
        scenario: {
          id: 'scpi-no-france',
          name: 'Sans SCPI française',
          editable: false,
          subscriptionFeeRate: input.subscriptionFeeRate,
          distributionRate: input.distributionRate,
          revenueInFranceRate: 0,
        },
        output: withoutFranceScpiSimulation,
      },
      ...scpiParameterScenarios.map((scenario) => ({
        scenario,
        output: simulateScpiInvestment({
          ...input,
          subscriptionFeeRate: scenario.subscriptionFeeRate,
          distributionRate: scenario.distributionRate,
          revenueInFranceRate: scenario.revenueInFranceRate,
        }),
      })),
    ],
    [input, scpiParameterScenarios, simulation, withoutForeignScpiSimulation, withoutFranceScpiSimulation],
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

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY_SCPI_PARAMETER_SCENARIOS,
        JSON.stringify(scpiParameterScenarios),
      )
    } catch {
      // Ignore persistence issues
    }
  }, [scpiParameterScenarios])

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

  function handleAddNewScpiParameterScenario(): void {
    const nextIndex = scpiParameterScenarios.length + 1
    setScpiParameterScenarios((current) => [
      ...current,
      {
        id: `scpi-params-${Date.now()}-${nextIndex}`,
        name: `Scénario ${nextIndex}`,
        editable: true,
        subscriptionFeeRate: input.subscriptionFeeRate,
        distributionRate: input.distributionRate,
        revenueInFranceRate: input.revenueInFranceRate,
      },
    ])
  }

  function handleUpdateScpiParameterScenario(
    id: string,
    patch: Partial<ScpiParameterScenario>,
  ): void {
    setScpiParameterScenarios((current) =>
      current.map((scenario) =>
        scenario.id === id ? { ...scenario, ...patch } : scenario,
      ),
    )
  }

  function handleRemoveScpiParameterScenario(id: string): void {
    setScpiParameterScenarios((current) =>
      current.filter((scenario) => !(scenario.id === id && scenario.editable)),
    )
  }

  function handleResetInput(): void {
    setInput(DEFAULT_SIMULATION_INPUT)
    setLoanScenarios(DEFAULT_LOAN_SCENARIOS)
    setScpiParameterScenarios(DEFAULT_SCPI_PARAMETER_SCENARIOS)
    try {
      window.localStorage.removeItem(STORAGE_KEY_SIMULATION_INPUT)
      window.localStorage.removeItem(STORAGE_KEY_LOAN_SCENARIOS)
      window.localStorage.removeItem(STORAGE_KEY_SCPI_PARAMETER_SCENARIOS)
    } catch {
      // Ignore persistence issues
    }
  }

  return (
    <main className="app-shell">
      <nav id="page-menu" className="page-menu" aria-label="Menu de navigation de la page">
        <p className="page-menu-title">Menu</p>
        <ul>
          {PAGE_MENU_SECTIONS.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.label}</a>
            </li>
          ))}
        </ul>
      </nav>

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

      <div id="section-form" className="menu-anchor-section">
        <SimulationForm input={input} onChange={setInput} onReset={handleResetInput} />
      </div>
      <div id="section-summary" className="menu-anchor-section">
        <SimulationSummary summary={simulation.summary} />
      </div>
      <div id="section-chart" className="menu-anchor-section">
        <ProjectionChart rows={simulation.yearlyResults} />
      </div>
      <div id="section-loan-scenarios" className="menu-anchor-section">
        <ScenarioComparison
          scenarios={loanScenarios}
          outputs={scenarioOutputs}
          onAddFromCurrent={handleAddNewScenario}
          onUpdateScenario={handleUpdateScenario}
          onRemoveScenario={handleRemoveScenario}
        />
      </div>
      <div id="section-scpi-scenarios" className="menu-anchor-section">
        <ScpiParameterComparison
          scenarios={scpiParameterScenarios}
          outputs={scpiParameterOutputs}
          onAddFromCurrent={handleAddNewScpiParameterScenario}
          onUpdateScenario={handleUpdateScpiParameterScenario}
          onRemoveScenario={handleRemoveScpiParameterScenario}
        />
      </div>
      <div id="section-yearly-results" className="menu-anchor-section">
        <YearlyResultsTable
          rows={simulation.yearlyResults}
          showDetailed={showDetailed}
          onToggleDetailed={setShowDetailed}
          onExportCsv={handleExportCsv}
        />
      </div>
      <div id="section-yearly-tax" className="menu-anchor-section">
        <YearlyTaxResultTable rows={simulation.yearlyResults} />
      </div>

      <a className="menu-fab" href="#page-menu" aria-label="Aller au menu" title="Aller au menu">
        ≡
      </a>
    </main>
  )
}

export default App
