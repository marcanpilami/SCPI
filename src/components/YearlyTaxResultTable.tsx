import { useState } from 'react'
import { formatEuro, formatPercent } from '../lib/format'
import type { YearlyResult } from '../types/simulation'

interface YearlyTaxResultTableProps {
  rows: YearlyResult[]
}

export function YearlyTaxResultTable({
  rows
}: YearlyTaxResultTableProps) {
  const [showAudit, setShowAudit] = useState(false)

  return (
    <section className="panel table-panel">
      <div className="panel-head">
        <div>
          <h2>Projection fiscale annuelle</h2>
          <p className="panel-subtitle">
            Vue synthétique par défaut, avec mode audit pour le détail des flux fiscaux.
          </p>
        </div>
        <div className="panel-actions">
          <label className="toggle-inline" htmlFor="tax-audit-toggle">
            <input
              id="tax-audit-toggle"
              type="checkbox"
              checked={showAudit}
              onChange={(event) => setShowAudit(event.target.checked)}
            />
            <span>Mode audit détaillé</span>
          </label>
        </div>
      </div>

      <details className="panel-subtitle">
        <summary>Afficher les explications fiscales</summary>
        <p>
          La fiscalité des SCPI investies au moins partiellement hors de France est régie par des conventions bilatérales entre chaque pays et la France.
        </p>
        <p>
          De façon générale, les revenus fonciers obéissent à deux mécanismes dont l'impact fiscal est le plus souvent similaire :
        </p>
        <ul>
          <li>Crédit d'impôt de l'impôt français. L'imposition des loyers a lieu dans le pays source, suivi d'une double imposition sur les mêmes sommes en France. Cette double imposition est ensuite éliminée par un crédit d'impôt équivalent à l'impôt supplémentaire payé en France. Cette opération n'est pas neutre, car elle augmente le taux effectif, et donc les impôts sur le reste du revenu imposable en France.</li>
          <li>Taux effectif. L'imposition des loyers a lieu dans le pays source, et ces mêmes loyers sont exonérés en France. Il faut quand même les déclarer en France, et rentrent dans le calcul du taux effectif qui est ensuite appliqué au revenu imposable normal.</li>
        </ul>
        <p>
          Il faut noter que toutes les sommes versées par les SCPI ne sont pas toujours des loyers, beaucoup versent également des revenus financiers qui sont traités différemment (le plus souvent imposés aux taux français avec une part donnée au pays étranger, ou avec un crédit d'impôt sur les impôts étrangers). Cet aspect est ignoré ici.
        </p>
        <p>
          La simulation ci-dessous utilise la méthode du crédit d'impôt français, mais les résultats sont très similaires avec la méthode du taux effectif. La réalité sera un mélange des deux, les conventions anciennes utilisant le taux effectif et les nouvelles le crédit d'impôt.
        </p>
        <p>
          Enfin, il faut noter que la fiscalité est très instable en France, et en conséquence cette simulation se révélera de façon certaine fausse au bout de quelques années.
        </p>
      </details>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Année</th>
              <th>Revenu brut SCPI</th>
              {showAudit && <th>Intérêts déductibles</th>}
              {showAudit && <th>Assurance déductible</th>}
              {showAudit && <th>Reports déductibles</th>}
              <th>Revenu foncier fiscal</th>
              {showAudit && <th>Déficit foncier reportable</th>}
              {showAudit && <th>Autres revenus imposables</th>}
              {showAudit && <th>Revenu mondial brut</th>}
              {showAudit && <th>Déductions revenu imposable</th>}
             
              <th>Revenu mondial imposable</th>
              {showAudit && <th>Impôt FR revenu théorique</th>}
              <th>Crédit d'impôt double imposition</th>
              {showAudit && <th>Impôt FR revenu</th>}
              {showAudit && <th>Taxes sociales FR</th>}
              {showAudit && <th>Impôts à l'étranger</th>}
              
              <th>Impôts totaux</th>
              <th>Impact fiscal SCPI</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year}>
                <td>{row.year}</td>
                <td>{formatEuro(row.grossRents)}
                  <span className="subcell">FR {formatEuro(row.grossRentsInFrance)}</span>
                  <span className="subcell">Monde {formatEuro(row.grossRentsAbroad)}</span>
                </td>
                {showAudit && (
                  <td>{formatEuro(row.bankInterestPaidInFrance + row.bankInterestPaidAbroad)}
                    <span className="subcell">FR {formatEuro(row.bankInterestPaidInFrance)}</span>
                    <span className="subcell">Monde {formatEuro(row.bankInterestPaidAbroad)}</span>
                  </td>
                )}
                {showAudit && (
                  <td>{formatEuro(row.loanInsurancePaidInFrance + row.loanInsurancePaidAbroad)}
                    <span className="subcell">FR {formatEuro(row.loanInsurancePaidInFrance)}</span>
                    <span className="subcell">Monde {formatEuro(row.loanInsurancePaidAbroad)}</span>
                  </td>
                )}
                {showAudit && (
                  <td>{formatEuro(row.landDeficitUsedInFrance)}
                    <span className="subcell">FR {formatEuro(row.landDeficitUsedInFrance)}</span>
                    <span className="subcell">Monde {formatEuro(0)}</span>
                  </td>
                )}
                <td>{formatEuro(row.fiscalLandRevenueInFrance + row.fiscalLandRevenueAbroad)}
                  <span className="subcell">FR {formatEuro(row.fiscalLandRevenueInFrance)}</span>
                  <span className="subcell">Monde {formatEuro(row.fiscalLandRevenueAbroad)}</span>
                </td>
                {showAudit && (
                  <td>{formatEuro(row.landDeficitInFrance)}
                    <span className="subcell">FR {formatEuro(row.landDeficitInFrance)}</span>
                    <span className="subcell">Monde {formatEuro(0)}</span>
                  </td>
                )}
                {showAudit && <td>{formatEuro(row.nonScpiTaxableIncome)}</td>}
                {showAudit && <td>{formatEuro(row.worldGrossIncome)}</td>}
                {showAudit && <td>{formatEuro(row.nonScpiTaxableIncomeDeductions)}</td>}
                <td>{formatEuro(row.worldTaxableIncome)}</td>
                {showAudit && (
                  <td>{formatEuro(row.theoreticalTaxesOnWorldInFrance)}
                    <span className="subcell">TE {formatPercent(row.franceTheoreticalAverageIncomeTaxRate)}</span>
                  </td>
                )}
                <td>{formatEuro(row.frenchTaxCreditToRemoveDoubleTaxes)}</td>
                {showAudit && (
                  <td>{formatEuro(row.allIncomeTaxesPaidInFrance)}
                    <span className="subcell">TE {formatPercent(row.franceAverageIncomeTaxRate)}</span>
                  </td>
                )}
                {showAudit && <td>{formatEuro(row.socialContributionsFrance)}</td>}
                {showAudit && <td>{formatEuro(row.scpiTaxesPaidAbroad)}</td>}
                <td>{formatEuro(row.yearlyTotalTaxesPaid)}
                  <span className="subcell">TE {formatPercent(row.worldAverageTaxRate)}</span>                  
                </td>
                <td>
                  <strong>{formatEuro(row.scpiTaxesPaid)}</strong>
                  <span className="subcell">TE SCPI {formatPercent(row.scpiAverageTaxRate)}</span>
                </td>                                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}