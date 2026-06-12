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

            <br/>Le profit cumulé est la somme des profits (loyers moins impôts moins effort) de toutes les années précédentes ajouté à la plus value latente des parts.
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
            <span>Mode audit détaillé</span>
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
              <th>Année</th>
              <th>Loyers perçus</th>
              {showDetailed && <th>Revenu imposable France</th>}
              {showDetailed && <th>Impôts France</th>}
              {showDetailed && <th>Revenu imposable monde</th>}
              {showDetailed && <th>Impôts monde</th>}
              <th>Impôts totaux</th>
              <th>Remboursé banque</th>
              {showDetailed && <th>Capital restant dû</th>}
              {showDetailed && <th>Assurance emprunteur</th>}
              <th>Effort net</th>
              {showDetailed && <th>Effort cumulatif (capital)</th>}
              {showDetailed && <th>Trésorerie (loyers nets cumulés)</th>}
              <th>Parts{showDetailed && " (immobilisations)"}</th>
              {showDetailed && <th>Valorisation totale</th>}
              <th>Profit cumulé</th>
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
                {showDetailed && <td>{formatEuro(row.endOfyearCapital)}</td>}
                {showDetailed && <td>{formatEuro(row.endOfYearCashValuation)}</td>}
                <td>{formatEuro(row.endOfYearFixedAssetsValuation)}</td>
                {showDetailed && <td>{formatEuro(row.endOfYearValuation)}</td>}
                <td className={row.endofYearLatentProfit >= 0 ? 'positive' : 'negative'}>
                  {formatEuro(row.endofYearLatentProfit)}
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
