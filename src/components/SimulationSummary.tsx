import { formatEuro, formatMultiplier } from '../lib/format'
import type { SimulationSummary as SimulationSummaryType } from '../types/simulation'

interface SimulationSummaryProps {
  summary: SimulationSummaryType
}

export function SimulationSummary({ summary }: SimulationSummaryProps) {
  return (
    <section className="summary-grid" aria-label="Synthese">
      <article className="summary-card">
        <h3>Montant emprunté total</h3>
        <p>{formatEuro(summary.totalBorrowedAmount)}</p>
      </article>
      <article className="summary-card">
        <h3>Effort total consenti</h3>
        <p>{formatEuro(summary.totalOutOfPocket)}</p>
        <span className="subcell">dont frais totaux: {formatEuro(summary.totalFees)}</span>
      </article>
      <article className="summary-card">
        <h3>Valeur finale des actifs</h3>
        <p>{formatEuro(summary.finalFixedAssetsValue)}</p>
        <span className="subcell">en fin de simulation</span>
      </article>
      <article className="summary-card">
        <h3>Revenu annuel</h3>
        <p className={summary.annualIncomeAfterLoan >= 0 ? 'positive' : 'negative'}>
          {formatEuro(summary.annualIncomeAfterLoan)}
        </p>
        <span className="subcell">à la date de fin de prêt</span>
      </article>
      <article className="summary-card">
        <h3>Effet de levier</h3>
        <p className={summary.leverageRatio >= 1 ? 'positive' : 'negative'}
           title="Valeur des actifs en fin de remboursement / Fonds propres engagés à cette date">
          {formatMultiplier(summary.leverageRatio)}
        </p>
        <span className="subcell">à la date de fin de prêt</span>
      </article>
    </section>
  )
}
