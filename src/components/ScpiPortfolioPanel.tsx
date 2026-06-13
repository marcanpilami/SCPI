import { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_SCPI_DATABASE, INPUT_LIMITS } from '../config/constants'
import { asNumber, asPercent, asString, clamp, createId, fromPercent } from '../lib/formHelpers'
import type { ScpiDatabaseEntry, SimulationInput } from '../types/simulation'

interface PortfolioLine {
  id: string
  scpiId: string
  weight: number
}

type EditorMode = 'hidden' | 'edit' | 'create'

interface ScpiPortfolioPanelProps {
  input: SimulationInput
  onChange: (nextInput: SimulationInput) => void
  resetSignal?: number
}

const STORAGE_KEY_SCPI_DATABASE = 'scpi:scpi-database'
const STORAGE_KEY_SCPI_PORTFOLIO_LINES = 'scpi:scpi-portfolio-lines'
const STORAGE_KEY_SCPI_PANEL_OPEN = 'scpi:scpi-portfolio-panel-open'
const PORTFOLIO_WEIGHT_TARGET = 100
const PORTFOLIO_WEIGHT_TOLERANCE = 0.01

function createEmptyScpiEntry(): ScpiDatabaseEntry {
  return {
    id: createId('scpi'),
    name: 'Nouvelle SCPI',
    organization: 'Societe de gestion',
    enjoymentDelayMonths: 6,
    subscriptionFeeRate: 0.1,
    managementFeeRate: 0.12,
    distributionFrequency: 'quarterly',
    franceShareRate: 0.2,
    sharePurchasePrice: 200,
    distributionRate: 0.055,
    pgaRate: 0.002,
    irr10Years: 0.05,
    creationYear: new Date().getFullYear(),
  }
}

function buildDefaultPortfolioLines(database: ScpiDatabaseEntry[]): PortfolioLine[] {
  if (database.length === 0) {
    return []
  }

  return [
    {
      id: createId('portfolio-line'),
      scpiId: database[0].id,
      weight: PORTFOLIO_WEIGHT_TARGET,
    },
  ]
}

function normalizeScpiEntry(value: unknown, index: number): ScpiDatabaseEntry | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as Partial<ScpiDatabaseEntry>

  return {
    id: asString(raw.id, `scpi-${index + 1}`),
    name: asString(raw.name, `SCPI ${index + 1}`),
    organization: asString(raw.organization, 'Societe de gestion'),
    enjoymentDelayMonths: asNumber(raw.enjoymentDelayMonths, 6),
    subscriptionFeeRate: asNumber(raw.subscriptionFeeRate, 0.1),
    managementFeeRate: asNumber(raw.managementFeeRate, 0.12),
    distributionFrequency: asString(raw.distributionFrequency, 'quarterly'),
    franceShareRate: asNumber(raw.franceShareRate, 0.2),
    sharePurchasePrice: asNumber(raw.sharePurchasePrice, 200),
    distributionRate: asNumber(raw.distributionRate, 0.055),
    pgaRate: asNumber(raw.pgaRate, 0.002),
    irr10Years: asNumber(raw.irr10Years, 0.05),
    creationYear: Math.round(asNumber(raw.creationYear, new Date().getFullYear())),
  }
}

function readPersistedScpiDatabase(): ScpiDatabaseEntry[] {
  if (typeof window === 'undefined') {
    return DEFAULT_SCPI_DATABASE
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_SCPI_DATABASE)
    if (!raw) {
      return DEFAULT_SCPI_DATABASE
    }

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return DEFAULT_SCPI_DATABASE
    }

    const normalized = parsed
      .map((entry, index) => normalizeScpiEntry(entry, index))
      .filter((entry): entry is ScpiDatabaseEntry => entry !== null)

    return normalized.length > 0 ? normalized : DEFAULT_SCPI_DATABASE
  } catch {
    return DEFAULT_SCPI_DATABASE
  }
}

function readPersistedPortfolioLines(database: ScpiDatabaseEntry[]): PortfolioLine[] {
  if (typeof window === 'undefined') {
    return buildDefaultPortfolioLines(database)
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_SCPI_PORTFOLIO_LINES)
    if (!raw) {
      return buildDefaultPortfolioLines(database)
    }

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return buildDefaultPortfolioLines(database)
    }

    const firstScpiId = database[0]?.id ?? ''
    const normalized = parsed
      .map((line, index) => {
        if (!line || typeof line !== 'object') {
          return null
        }

        const rawLine = line as Partial<PortfolioLine>
        const requestedScpiId = asString(rawLine.scpiId, firstScpiId)
        const hasRequestedScpi = database.some((entry) => entry.id === requestedScpiId)
        return {
          id: asString(rawLine.id, createId(`portfolio-line-${index + 1}`)),
          scpiId: hasRequestedScpi ? requestedScpiId : firstScpiId,
          weight: asNumber(rawLine.weight, 0),
        }
      })
      .filter((line): line is PortfolioLine => line !== null)

    return normalized.length > 0 ? normalized : buildDefaultPortfolioLines(database)
  } catch {
    return buildDefaultPortfolioLines(database)
  }
}

function readPersistedPanelState(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY_SCPI_PANEL_OPEN) === '1'
  } catch {
    return false
  }
}

function clearScpiPortfolioStorage(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY_SCPI_DATABASE)
    window.localStorage.removeItem(STORAGE_KEY_SCPI_PORTFOLIO_LINES)
    window.localStorage.removeItem(STORAGE_KEY_SCPI_PANEL_OPEN)
  } catch {
    // Ignore persistence issues.
  }
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
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix: string
  onChange: (value: number) => void
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
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="field-suffix">{suffix}</span>
      </span>
    </label>
  )
}

export function ScpiPortfolioPanel({ input, onChange, resetSignal = 0 }: ScpiPortfolioPanelProps) {
  const lastHandledResetSignalRef = useRef(resetSignal)
  const [scpiDatabase, setScpiDatabase] = useState<ScpiDatabaseEntry[]>(() =>
    readPersistedScpiDatabase(),
  )
  const [portfolioLines, setPortfolioLines] = useState<PortfolioLine[]>(() =>
    readPersistedPortfolioLines(readPersistedScpiDatabase()),
  )
  const [isPortfolioPanelOpen, setIsPortfolioPanelOpen] = useState<boolean>(() =>
    readPersistedPanelState(),
  )
  const [selectedScpiId, setSelectedScpiId] = useState<string>(() =>
    readPersistedScpiDatabase()[0]?.id ?? '',
  )
  const [editorMode, setEditorMode] = useState<EditorMode>('hidden')
  const [editorDraft, setEditorDraft] = useState<ScpiDatabaseEntry | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(STORAGE_KEY_SCPI_DATABASE, JSON.stringify(scpiDatabase))
    } catch {
      // Ignore persistence issues.
    }
  }, [scpiDatabase])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY_SCPI_PORTFOLIO_LINES,
        JSON.stringify(portfolioLines),
      )
    } catch {
      // Ignore persistence issues.
    }
  }, [portfolioLines])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(STORAGE_KEY_SCPI_PANEL_OPEN, isPortfolioPanelOpen ? '1' : '0')
    } catch {
      // Ignore persistence issues.
    }
  }, [isPortfolioPanelOpen])

  useEffect(() => {
    const selectedExists = scpiDatabase.some((entry) => entry.id === selectedScpiId)
    if (!selectedExists) {
      setSelectedScpiId(scpiDatabase[0]?.id ?? '')
    }
  }, [scpiDatabase, selectedScpiId])

  useEffect(() => {
    if (lastHandledResetSignalRef.current === resetSignal) {
      return
    }

    lastHandledResetSignalRef.current = resetSignal

    setScpiDatabase(DEFAULT_SCPI_DATABASE)
    setPortfolioLines(buildDefaultPortfolioLines(DEFAULT_SCPI_DATABASE))
    setIsPortfolioPanelOpen(false)
    setSelectedScpiId(DEFAULT_SCPI_DATABASE[0]?.id ?? '')
    setEditorMode('hidden')
    setEditorDraft(null)
  }, [resetSignal])

  const totalWeight = useMemo(
    () => portfolioLines.reduce((sum, line) => sum + (Number.isFinite(line.weight) ? line.weight : 0), 0),
    [portfolioLines],
  )

  const isWeightValid =
    portfolioLines.length > 0 &&
    Math.abs(totalWeight - PORTFOLIO_WEIGHT_TARGET) <= PORTFOLIO_WEIGHT_TOLERANCE

  const weightedPortfolio = useMemo(() => {
    return portfolioLines
      .map((line) => {
        const entry = scpiDatabase.find((candidate) => candidate.id === line.scpiId)
        if (!entry || !Number.isFinite(line.weight) || line.weight <= 0) {
          return null
        }

        return {
          entry,
          weight: line.weight,
        }
      })
      .filter(
        (candidate): candidate is { entry: ScpiDatabaseEntry; weight: number } =>
          candidate !== null,
      )
  }, [portfolioLines, scpiDatabase])

  const selectedEntry = scpiDatabase.find((entry) => entry.id === selectedScpiId) ?? null

  function handleAddPortfolioLine(): void {
    const fallbackId = selectedScpiId || scpiDatabase[0]?.id || ''

    if (fallbackId === '') {
      setEditorMode('create')
      setEditorDraft(createEmptyScpiEntry())
      return
    }

    setPortfolioLines((current) => [
      ...current,
      {
        id: createId('portfolio-line'),
        scpiId: fallbackId,
        weight: 0,
      },
    ])
  }

  function handleRemovePortfolioLine(id: string): void {
    setPortfolioLines((current) => current.filter((line) => line.id !== id))
  }

  function handleUpdatePortfolioLine<K extends keyof PortfolioLine>(
    id: string,
    key: K,
    value: PortfolioLine[K],
  ): void {
    setPortfolioLines((current) =>
      current.map((line) => (line.id === id ? { ...line, [key]: value } : line)),
    )
  }

  function handleApplyPortfolio(): void {
    if (!isWeightValid || weightedPortfolio.length === 0) {
      return
    }

    const totalApplicableWeight = weightedPortfolio.reduce(
      (sum, candidate) => sum + candidate.weight,
      0,
    )

    if (!Number.isFinite(totalApplicableWeight) || totalApplicableWeight <= 0) {
      return
    }

    const weightedDelayMonths =
      weightedPortfolio.reduce(
        (sum, candidate) => sum + candidate.entry.enjoymentDelayMonths * candidate.weight,
        0,
      ) / totalApplicableWeight
    const weightedDistributionRate =
      weightedPortfolio.reduce(
        (sum, candidate) => sum + candidate.entry.distributionRate * candidate.weight,
        0,
      ) / totalApplicableWeight
      
    const weightedSubscriptionFeeRate =
      weightedPortfolio.reduce(
        (sum, candidate) => sum + candidate.entry.subscriptionFeeRate * candidate.weight,
        0,
      ) / totalApplicableWeight
    const weightedRevenueInFranceRate =
      weightedPortfolio.reduce(
        (sum, candidate) => sum + candidate.entry.franceShareRate * candidate.weight,
        0,
      ) / totalApplicableWeight

    onChange({
      ...input,
      enjoymentDelayMonths: Math.round(
        clamp(
          Math.round(weightedDelayMonths) + 1,
          INPUT_LIMITS.enjoymentDelayMonths.min,
          INPUT_LIMITS.enjoymentDelayMonths.max,
        ),
      ),
      distributionRate: clamp(
        Math.round(weightedDistributionRate * 10000) / 10000,
        INPUT_LIMITS.distributionRate.min,
        INPUT_LIMITS.distributionRate.max,
      ),
      subscriptionFeeRate: clamp(
        Math.round(weightedSubscriptionFeeRate * 10000) / 10000,
        INPUT_LIMITS.subscriptionFeeRate.min,
        INPUT_LIMITS.subscriptionFeeRate.max,
      ),
      revenueInFranceRate: clamp(
        Math.round(weightedRevenueInFranceRate * 10000) / 10000,
        INPUT_LIMITS.revenueInFranceRate.min,
        INPUT_LIMITS.revenueInFranceRate.max,
      ),
    })

    setIsPortfolioPanelOpen(false)
  }

  function handleEditSelectedEntry(): void {
    if (!selectedEntry) {
      return
    }

    setEditorMode('edit')
    setEditorDraft({ ...selectedEntry })
  }

  function handleCreateEntry(): void {
    setEditorMode('create')
    setEditorDraft(createEmptyScpiEntry())
  }

  function handleDeleteSelectedEntry(): void {
    if (!selectedEntry) {
      return
    }

    const id = selectedEntry.id
    setScpiDatabase((current) => {
      const nextDatabase = current.filter((entry) => entry.id !== id)
      const fallbackScpiId = nextDatabase[0]?.id ?? ''

      setPortfolioLines((existingLines) =>
        existingLines.map((line) =>
          line.scpiId === id
            ? {
                ...line,
                scpiId: fallbackScpiId,
              }
            : line,
        ),
      )

      return nextDatabase
    })
  }

  function handleDraftChange<K extends keyof ScpiDatabaseEntry>(
    key: K,
    value: ScpiDatabaseEntry[K],
  ): void {
    setEditorDraft((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        [key]: value,
      }
    })
  }

  function handleResetDatabase(): void {
    clearScpiPortfolioStorage()
    setScpiDatabase(DEFAULT_SCPI_DATABASE)
    setPortfolioLines(buildDefaultPortfolioLines(DEFAULT_SCPI_DATABASE))
    setSelectedScpiId(DEFAULT_SCPI_DATABASE[0]?.id ?? '')
    setEditorMode('hidden')
    setEditorDraft(null)
  }

  function handleCancelEditor(): void {
    setEditorMode('hidden')
    setEditorDraft(null)
  }

  function handleSaveEditor(): void {
    if (!editorDraft) {
      return
    }

    if (editorMode === 'create') {
      setScpiDatabase((current) => [...current, editorDraft])
      setSelectedScpiId(editorDraft.id)
    } else {
      setScpiDatabase((current) =>
        current.map((entry) => (entry.id === editorDraft.id ? editorDraft : entry)),
      )
    }

    setEditorMode('hidden')
    setEditorDraft(null)
  }

  return (
    <div className="scpi-portfolio-panel">
      <button
        type="button"
        className="scpi-portfolio-toggle"
        onClick={() => setIsPortfolioPanelOpen((current) => !current)}
        aria-expanded={isPortfolioPanelOpen}
      >
        <span className="scpi-portfolio-toggle-title">Option : pré-remplir ce formulaire à partir d'un portefeuille de SCPI</span>
        <span className="scpi-portfolio-toggle-chevron" aria-hidden="true">
          {isPortfolioPanelOpen ? '▾' : '▸'}
        </span>
      </button>

      {isPortfolioPanelOpen && (
        <div className="scpi-portfolio-content">
          <p className="scpi-portfolio-note">
            Sélectionnez les SCPI qui composent votre portefeuille. Vous pouvez créer de nouvelles entrées ou éditer les entrées existantes.
          </p>

          <div className="scpi-portfolio-block">
            <div className="scpi-portfolio-block-head">
              <h3>Repartition du portefeuille</h3>
              <button type="button" className="btn btn-secondary" onClick={handleAddPortfolioLine}>
                Ajouter une ligne
              </button>
            </div>

            {portfolioLines.length === 0 && (
              <p className="scpi-inline-info">
                Aucune ligne pour le moment. Ajoutez une ligne pour construire votre portefeuille.
              </p>
            )}

            <div className="scpi-portfolio-lines">
              {portfolioLines.map((line) => (
                <div className="scpi-portfolio-line" key={line.id}>
                  <label className="field" htmlFor={`line-scpi-${line.id}`}>
                    <span className="field-label">SCPI</span>
                    <select
                      id={`line-scpi-${line.id}`}
                      className="scpi-select"
                      value={line.scpiId}
                      onChange={(event) =>
                        handleUpdatePortfolioLine(line.id, 'scpiId', event.target.value)
                      }
                    >
                      {scpiDatabase.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field" htmlFor={`line-weight-${line.id}`}>
                    <span className="field-label">Poids</span>
                    <span className="field-input-wrap">
                      <input
                        id={`line-weight-${line.id}`}
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={Number.isFinite(line.weight) ? line.weight : ''}
                        onChange={(event) =>
                          handleUpdatePortfolioLine(line.id, 'weight', Number(event.target.value))
                        }
                      />
                      <span className="field-suffix">%</span>
                    </span>
                  </label>

                  <button
                    type="button"
                    className="btn btn-danger scpi-line-delete"
                    onClick={() => handleRemovePortfolioLine(line.id)}
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>

            <div className="scpi-portfolio-summary-row">
              <p className={isWeightValid ? 'scpi-total scpi-total-valid' : 'scpi-total scpi-total-invalid'}>
                Total portefeuille: {totalWeight.toFixed(2)}%
              </p>
              <button
                type="button"
                className="btn"
                onClick={handleApplyPortfolio}
                disabled={!isWeightValid || weightedPortfolio.length === 0}
              >
                Utiliser ce portefeuille
              </button>
            </div>
          </div>

          <div className="scpi-portfolio-block">
            <div className="scpi-portfolio-block-head">
              <h3>Base locale des SCPI</h3>
              <div className="scpi-editor-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleEditSelectedEntry}
                  disabled={!selectedEntry}
                >
                  Éditer l'entrée sélectionnée
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCreateEntry}>
                  Nouvelle entrée
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteSelectedEntry}
                  disabled={!selectedEntry}
                >
                  Supprimer
                </button>
              </div>
            </div>

            <div className="scpi-db-selector-list">
              {scpiDatabase.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={
                    entry.id === selectedScpiId
                      ? 'scpi-db-selector-btn scpi-db-selector-btn-active'
                      : 'scpi-db-selector-btn'
                  }
                  onClick={() => setSelectedScpiId(entry.id)}
                >
                  <strong>{entry.name}</strong>
                  <span className="scpi-db-selector-sub">
                    <span>{entry.organization}</span>
                    <span>{asPercent(entry.distributionRate).toFixed(2)} %</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="scpi-db-reset-row">
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleResetDatabase}
              >
                Réinitialiser la base
              </button>
            </div>

            {editorDraft && editorMode !== 'hidden' && (
              <div className="scpi-editor-form-wrap">
                <h3>{editorMode === 'create' ? 'Nouvelle entree SCPI' : "Edition de l'entree"}</h3>
                <div className="scpi-db-grid">
                  <label className="field" htmlFor="scpi-editor-name">
                    <span className="field-label">Nom</span>
                    <input
                      id="scpi-editor-name"
                      type="text"
                      className="scpi-text-input"
                      value={editorDraft.name}
                      onChange={(event) => handleDraftChange('name', event.target.value)}
                    />
                  </label>

                  <label className="field" htmlFor="scpi-editor-organization">
                    <span className="field-label">Societe de gestion</span>
                    <input
                      id="scpi-editor-organization"
                      type="text"
                      className="scpi-text-input"
                      value={editorDraft.organization}
                      onChange={(event) => handleDraftChange('organization', event.target.value)}
                    />
                  </label>

                  <NumberField
                    id="scpi-editor-delay"
                    label="Delai de jouissance"
                    value={editorDraft.enjoymentDelayMonths}
                    min={0}
                    max={36}
                    step={1}
                    suffix="mois"
                    onChange={(value) => handleDraftChange('enjoymentDelayMonths', value)}
                  />

                  <NumberField
                    id="scpi-editor-distribution"
                    label="Taux de distribution"
                    value={asPercent(editorDraft.distributionRate)}
                    min={0}
                    max={20}
                    step={0.01}
                    suffix="%"
                    onChange={(value) => handleDraftChange('distributionRate', fromPercent(value))}
                  />

                  <NumberField
                    id="scpi-editor-subscription-fee"
                    label="Frais de souscription"
                    value={asPercent(editorDraft.subscriptionFeeRate)}
                    min={0}
                    max={30}
                    step={0.01}
                    suffix="%"
                    onChange={(value) =>
                      handleDraftChange('subscriptionFeeRate', fromPercent(value))
                    }
                  />

                  <NumberField
                    id="scpi-editor-management-fee"
                    label="Frais de gestion"
                    value={asPercent(editorDraft.managementFeeRate)}
                    min={0}
                    max={25}
                    step={0.01}
                    suffix="%"
                    onChange={(value) => handleDraftChange('managementFeeRate', fromPercent(value))}
                  />

                  <NumberField
                    id="scpi-editor-france-share"
                    label="Part des revenus en France"
                    value={asPercent(editorDraft.franceShareRate)}
                    min={0}
                    max={100}
                    step={0.1}
                    suffix="%"
                    onChange={(value) => handleDraftChange('franceShareRate', fromPercent(value))}
                  />

                  <NumberField
                    id="scpi-editor-share-price"
                    label="Prix de souscription d'une part"
                    value={editorDraft.sharePurchasePrice}
                    min={0}
                    max={10000}
                    step={1}
                    suffix="EUR"
                    onChange={(value) => handleDraftChange('sharePurchasePrice', value)}
                  />

                  <NumberField
                    id="scpi-editor-price-growth"
                    label="PGA"
                    value={asPercent(editorDraft.pgaRate)}
                    min={-10}
                    max={10}
                    step={0.01}
                    suffix="%"
                    onChange={(value) =>
                      handleDraftChange('pgaRate', fromPercent(value))
                    }
                  />

                  <NumberField
                    id="scpi-editor-irr"
                    label="TRI 10 ans"
                    value={asPercent(editorDraft.irr10Years)}
                    min={-10}
                    max={30}
                    step={0.01}
                    suffix="%"
                    onChange={(value) => handleDraftChange('irr10Years', fromPercent(value))}
                  />

                  <label className="field" htmlFor="scpi-editor-frequency">
                    <span className="field-label">Frequence de distribution</span>
                    <input
                      id="scpi-editor-frequency"
                      type="text"
                      className="scpi-text-input"
                      value={editorDraft.distributionFrequency}
                      onChange={(event) =>
                        handleDraftChange('distributionFrequency', event.target.value)
                      }
                    />
                  </label>

                  <NumberField
                    id="scpi-editor-creation-year"
                    label="Annee de creation"
                    value={editorDraft.creationYear}
                    min={1900}
                    max={2100}
                    step={1}
                    suffix=""
                    onChange={(value) => handleDraftChange('creationYear', Math.round(value))}
                  />
                </div>

                <div className="scpi-editor-actions">
                  <button type="button" className="btn" onClick={handleSaveEditor}>
                    Enregistrer
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancelEditor}>
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
