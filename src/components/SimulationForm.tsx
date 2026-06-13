import { useState } from 'react'
import { INPUT_LIMITS } from '../config/constants'
import { ScpiPortfolioPanel } from './ScpiPortfolioPanel'
import type { SimulationInput } from '../types/simulation'

interface SimulationFormProps {
  input: SimulationInput
  onChange: (nextInput: SimulationInput) => void
  onReset?: () => void
}

function asPercent(value: number): number {
  return value * 100
}

function fromPercent(value: number): number {
  return value / 100
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
  disabled,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix: string
  onChange: (value: number) => void
  disabled?: boolean
}) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className="field-input-wrap">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : ''}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="field-suffix">{suffix}</span>
      </span>
    </label>
  )
}

export function SimulationForm({ input, onChange, onReset }: SimulationFormProps) {
  const [resetSignal, setResetSignal] = useState(0)

  const update = <K extends keyof SimulationInput>(key: K, value: SimulationInput[K]) => {
    onChange({
      ...input,
      [key]: value,
    })
  }

  function handleResetClick(): void {
    setResetSignal((current) => current + 1)
    onReset?.()
  }

  return (
    <section className="panel form-panel">
      <div className="panel-head">
        <div>
          <h2>Paramètres de simulation</h2>
          <p className="panel-subtitle">
            Tous les calculs sont annuels et affichés en euros constants.
          </p>
        </div>
        {onReset && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResetClick}
            title="Restaurer les paramètres par défaut et effacer l'historique sauvegardé"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="form-groups">
        <fieldset className="form-group">
          <legend className="form-group-legend">Prêt bancaire</legend>
          <div className="form-grid">
            <label className="toggle toggle-span" htmlFor="use-loan">
              <input
                id="use-loan"
                type="checkbox"
                checked={input.useLoan}
                onChange={(event) => update('useLoan', event.target.checked)}
              />
              <span>Utiliser un prêt bancaire</span>
            </label>

            <NumberField
              id="downPaymentAmount"
              label="Apport initial"
              value={input.downPaymentAmount}
              min={INPUT_LIMITS.downPaymentAmount.min}
              max={INPUT_LIMITS.downPaymentAmount.max}
              step={500}
              suffix="EUR"
              disabled={!input.useLoan}
              onChange={(value) => update('downPaymentAmount', value)}
            />

            <NumberField
              id="loanDurationYears"
              label="Duree du prêt"
              value={input.loanDurationYears}
              min={INPUT_LIMITS.loanDurationYears.min}
              max={INPUT_LIMITS.loanDurationYears.max}
              step={1}
              suffix="ans"
              disabled={!input.useLoan}
              onChange={(value) => update('loanDurationYears', value)}
            />

            <NumberField
              id="loanAnnualRate"
              label="Taux du prêt"
              value={asPercent(input.loanAnnualRate)}
              min={INPUT_LIMITS.loanAnnualRate.min * 100}
              max={INPUT_LIMITS.loanAnnualRate.max * 100}
              step={0.01}
              suffix="%"
              disabled={!input.useLoan}
              onChange={(value) => update('loanAnnualRate', fromPercent(value))}
            />

            <NumberField
              id="loanAnnualInsuranceRate"
              label="Taux assurance emprunteur"
              value={asPercent(input.loanAnnualInsuranceRate)}
              min={INPUT_LIMITS.loanAnnualInsuranceRate.min * 100}
              max={INPUT_LIMITS.loanAnnualInsuranceRate.max * 100}
              step={0.01}
              suffix="%"
              disabled={!input.useLoan}
              onChange={(value) => update('loanAnnualInsuranceRate', fromPercent(value))}
            />
          </div>
        </fieldset>

        <fieldset className="form-group">
          <legend className="form-group-legend">SCPI &amp; investissement</legend>
          <ScpiPortfolioPanel input={input} onChange={onChange} resetSignal={resetSignal} />
          <div className="form-grid">
            <NumberField
              id="investmentAmount"
              label="Montant investi"
              value={input.investmentAmount}
              min={INPUT_LIMITS.investmentAmount.min}
              max={INPUT_LIMITS.investmentAmount.max}
              step={1000}
              suffix="EUR"
              onChange={(value) => update('investmentAmount', value)}
            />

            <NumberField
              id="otherInitialExpenses"
              label="Autres frais initiaux"
              value={input.otherInitialExpenses}
              min={INPUT_LIMITS.otherInitialExpenses.min}
              max={INPUT_LIMITS.otherInitialExpenses.max}
              step={100}
              suffix="EUR"
              onChange={(value) => update('otherInitialExpenses', value)}
            />

            <NumberField
              id="horizonYears"
              label="Horizon de simulation"
              value={input.horizonYears}
              min={INPUT_LIMITS.horizonYears.min}
              max={INPUT_LIMITS.horizonYears.max}
              step={1}
              suffix="ans"
              onChange={(value) => update('horizonYears', value)}
            />
            
            <NumberField
              id="subscriptionFeeRate"
              label="Frais de souscription"
              value={asPercent(input.subscriptionFeeRate)}
              min={INPUT_LIMITS.subscriptionFeeRate.min * 100}
              max={INPUT_LIMITS.subscriptionFeeRate.max * 100}
              step={0.01}
              suffix="%"
              onChange={(value) => update('subscriptionFeeRate', fromPercent(value))}
            />

            <NumberField
              id="distributionRate"
              label="Taux de distribution (TD)"
              value={asPercent(input.distributionRate)}
              min={INPUT_LIMITS.distributionRate.min * 100}
              max={INPUT_LIMITS.distributionRate.max * 100}
              step={0.01}
              suffix="%"
              onChange={(value) => update('distributionRate', fromPercent(value))}
            />

            <NumberField
              id="enjoymentDelayMonths"
              label="Delai de jouissance"
              value={input.enjoymentDelayMonths}
              min={INPUT_LIMITS.enjoymentDelayMonths.min}
              max={INPUT_LIMITS.enjoymentDelayMonths.max}
              step={1}
              suffix="mois"
              onChange={(value) => update('enjoymentDelayMonths', value)}
            />

            <NumberField
              id="annualRevaluationRate"
              label="Revalorisation annuelle des parts"
              value={asPercent(input.annualRevaluationRate)}
              min={INPUT_LIMITS.annualRevaluationRate.min * 100}
              max={INPUT_LIMITS.annualRevaluationRate.max * 100}
              step={0.1}
              suffix="%"
              onChange={(value) => update('annualRevaluationRate', fromPercent(value))}
            />
          </div>
        </fieldset>

        <fieldset className="form-group">
          <legend className="form-group-legend">Fiscalite</legend>
          <div className="form-grid">
            <NumberField
              id="taxBracketRate"
              label="Tranche marginale d'imposition (TMI)"
              value={asPercent(input.taxBracketRate)}
              min={INPUT_LIMITS.taxBracketRate.min * 100}
              max={INPUT_LIMITS.taxBracketRate.max * 100}
              step={0.1}
              suffix="%"
              onChange={(value) => update('taxBracketRate', fromPercent(value))}
            />

            <NumberField
              id="revenueInFranceRate"
              label="Part des revenus en France"
              value={asPercent(input.revenueInFranceRate)}
              min={INPUT_LIMITS.revenueInFranceRate.min * 100}
              max={INPUT_LIMITS.revenueInFranceRate.max * 100}
              step={0.1}
              suffix="%"
              onChange={(value) => update('revenueInFranceRate', fromPercent(value))}
            />

            <NumberField
              id="foreignTaxRate"
              label="Taux d'imposition hors France"
              value={asPercent(input.foreignTaxRate)}
              min={INPUT_LIMITS.foreignTaxRate.min * 100}
              max={INPUT_LIMITS.foreignTaxRate.max * 100}
              step={0.1}
              suffix="%"
              onChange={(value) => update('foreignTaxRate', fromPercent(value))}
            />
          </div>
        </fieldset>
      </div>
    </section>
  )
}
