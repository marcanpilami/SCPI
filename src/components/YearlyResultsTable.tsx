import { formatEuro, formatPercent } from '../lib/format'
import type { YearlyResult } from '../types/simulation'

interface YearlyResultsTableProps {
  rows: YearlyResult[]
  showDetailed: boolean
  onToggleDetailed: (checked: boolean) => void
  onExportCsv: () => void
}

export function YearlyResultsTable({
  rows,
  showDetailed,
  onToggleDetailed,
  onExportCsv,
}: YearlyResultsTableProps) {
  return (
    <section className="panel table-panel">
      <div className="panel-head">
        <div>
          <h2>Projection annuelle</h2>
          <p className="panel-subtitle">
            Vue standard avec export CSV, ou mode audit pour voir les flux fiscaux.
          </p>
        </div>
        <div className="panel-actions">
          <label className="toggle-inline" htmlFor="detail-toggle">
            <input
              id="detail-toggle"
              type="checkbox"
              checked={showDetailed}
              onChange={(event) => onToggleDetailed(event.target.checked)}
            />
            <span>Mode audit detaille</span>
          </label>
          <button type="button" className="btn" onClick={onExportCsv}>
            Exporter CSV
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Annee</th>
              <th>Loyers percus</th>
              {showDetailed && <th>Revenu imposable France</th>}
              {showDetailed && <th>Impôts France</th>}
              {showDetailed && <th>Revenu imposable monde</th>}
              {showDetailed && <th>Impôts monde</th>}
              <th>Impots Totaux</th>
              <th>Remboursé banque</th>
              {showDetailed && <th>Capital restant dû</th>}
              {showDetailed && <th>Assurance emprunteur</th>}
              <th>Effort net</th>
              {showDetailed && <th>Effort cumulatif</th>}
              {showDetailed && <th>Profit cumulatif</th>}
              <th>Valeur des actifs</th>
              <th>Profit / perte globale</th>
              <th>Rendement</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year}>
                <td>{row.year}</td>
                <td>{formatEuro(row.grossRents)}</td>
                {showDetailed && <td>{formatEuro(row.taxableIncomeInFrance)}</td>}
                {showDetailed && <td>{formatEuro(row.taxesPaidInFrance)}</td>}
                {showDetailed && <td>{formatEuro(row.taxableIncomeAbroad)}</td>}
                {showDetailed && <td>{formatEuro(row.taxesPaidAbroad)}</td>}
                <td>{formatEuro(row.taxesPaid)}</td>
                <td>
                  {formatEuro(row.bankReimbursementTotal)}
                  <span className="subcell">
                    cap. {formatEuro(row.bankCapitalRepaid)} - int.{' '}
                    {formatEuro(row.bankInterestPaid)}
                  </span>
                </td>
                {showDetailed && <td>{formatEuro(row.loanRemainingCapital)}</td>}
                {showDetailed && <td>{formatEuro(row.loanInsurancePaid)}</td>}
                <td className={row.effortAmount <= 0 ? 'positive' : undefined}>
                  {formatEuro(row.effortAmount)}
                  <span className="subcell">
                    mensuel                    {formatEuro(row.effortAmount / 12)}
                  </span>
                </td>
                {showDetailed && <td>{formatEuro(row.cumulativeOutOfPocket)}</td>}
                {showDetailed && <td>{formatEuro(row.cumulativeProfit)}</td>}
                <td>{formatEuro(row.assetValueEnd)}</td>
                <td className={row.globalProfitLoss >= 0 ? 'positive' : 'negative'}>
                  {formatEuro(row.globalProfitLoss)}
                </td>
                <td className={row.annualYield >= 0 ? 'positive' : 'negative'}>
                  {formatPercent(row.annualYield)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
