import { formatEuro } from '../lib/format'
import type { SimulationOutput } from '../types/simulation'

interface LoanModeComparisonProps {
  withLoan: SimulationOutput
  withoutLoan: SimulationOutput
}

export function LoanModeComparison({
  withLoan,
  withoutLoan,
}: LoanModeComparisonProps) {
  return (
    <section className="panel">
      <h2>Comparaison avec prêt vs sans prêt</h2>
      <p className="panel-subtitle">
        Meme investissement SCPI, seule la modalite de financement change.
      </p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Indicateur</th>
              <th>Avec prêt</th>
              <th>Sans prêt</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Effort total consenti</td>
              <td>{formatEuro(withLoan.summary.totalOutOfPocket)}</td>
              <td>{formatEuro(withoutLoan.summary.totalOutOfPocket)}</td>
            </tr>
            <tr>
              <td>Impots totaux</td>
              <td>{formatEuro(withLoan.summary.totalTaxes)}</td>
              <td>{formatEuro(withoutLoan.summary.totalTaxes)}</td>
            </tr>
            <tr>
              <td>Valeur finale des actifs</td>
              <td>{formatEuro(withLoan.summary.finalAssetValue)}</td>
              <td>{formatEuro(withoutLoan.summary.finalAssetValue)}</td>
            </tr>
            <tr>
              <td>Resultat global final</td>
              <td
                className={
                  withLoan.summary.finalProfitLoss >= 0 ? 'positive' : 'negative'
                }
              >
                {formatEuro(withLoan.summary.finalProfitLoss)}
              </td>
              <td
                className={
                  withoutLoan.summary.finalProfitLoss >= 0 ? 'positive' : 'negative'
                }
              >
                {formatEuro(withoutLoan.summary.finalProfitLoss)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
