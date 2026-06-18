import { formatEuro, formatPercent } from '../lib/format';
import type { YearlyResult } from '../types/simulation'

interface YearlyTaxResultTableProps {
  rows: YearlyResult[]
}

export function YearlyTaxResultTable({
  rows
}: YearlyTaxResultTableProps) {
return (
    <section className="panel table-panel">
      <div className="panel-head">
        <div>
          <h2>Projection fiscale annuelle</h2>
          <p className="panel-subtitle">
            La fiscalité des SCPI investies au moins partiellement hors de France est régie par des conventions bilatérales entre chaque pays et la France. 
            De façon générale, les revenus fonciers obéissent à deux mécanismes dont l'impact fiscal est le plus souvent similaire :
            <ul>
              <li>Crédit d'impôt de l'impôt français. L'imposition des loyers a lieu dans le pays source, suivi d'une double imposition sur les mêmes sommes en France. Cette double imposition est ensuite éliminée par un crédit d'impôt équivalent à l'impôt supplémentaire payé en France. Cette opération n'est pas neutre, car elle augmente le taux effectif, et donc les impôts sur le reste du revenu imposable en France.</li>
              <li>Taux effectif. L'imposition des loyers a lieu dans le pays source, et ces mêmes loyers sont exonérés en France. Il faut quand même les déclarer en France, et rentrent dans le calcul du taux effectif qui est ensuite appliqué au revenu imposable normal.</li>
            </ul>
            
          </p>
          <p className="panel-subtitle">
            Il faut noter que toutes les sommes versées par les SCPI ne sont pas toujours des loyers, beaucoup versent également des revenus financiers qui sont traitées différemment (le plus souvent imposées aux taux français avec une part donnée au pays étranger, ou avec un crédit d'impôt sur les impôts étrangers). Cet aspect est ignoré ici.
<br/>
<br/>
            La simulation ci-dessous utilise la méthode du crédit d'impôt français, mais les résultats sont très similaires avec la méthode du taux effectif. La réalité sera un mélange des deux, les conventions anciennes utilisant le taux effectif et les nouvelles le crédit d'impôt.
          </p>
          <p className="panel-subtitle">
            Enfin, il faut noter que la fiscalité est très instable en France, et en conséquence cette simulation se révélera de façon certaine fausse au bout de quelques années.
          </p>
        </div>        
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Année</th>
              <th>Revenu brut SCPI</th>
              <th>Intérêts déductibles</th>
              <th>Assurance déductible</th>
              <th>Reports déductibles</th>
              <th>Revenu foncier fiscal</th>
              <th>Déficit foncier reportable</th>
              <th>Autres revenus imposables</th>
              <th>Revenu mondial brut</th>
              <th>Déductions revenu imposable</th>
              <th>Revenu mondial imposable</th>
              <th>Impôt FR revenu théorique</th>
              <th>Crédit d'impôt double imposition</th>
              <th>Impôt FR revenu</th>
              <th>Taxes sociales FR</th>
              <th>Impôts à l'étranger</th>
              <th>Impôts totaux</th>
              <th>Impact fiscal SCPI</th>
              <th>Impact étranger</th>
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
                <td>{formatEuro(row.bankInterestPaidInFrance + row.bankInterestPaidAbroad)}
                  <span className="subcell">FR {formatEuro(row.bankInterestPaidInFrance)}</span>
                  <span className="subcell">Monde {formatEuro(row.bankInterestPaidAbroad)}</span>
                </td>
                <td>{formatEuro(row.loanInsurancePaidInFrance + row.loanInsurancePaidAbroad)}
                  <span className="subcell">FR {formatEuro(row.loanInsurancePaidInFrance)}</span>
                  <span className="subcell">Monde {formatEuro(row.loanInsurancePaidAbroad)}</span>
                </td>
                <td>{formatEuro(row.landDeficitUsedInFrance)}
                  <span className="subcell">FR {formatEuro(row.landDeficitUsedInFrance)}</span>
                  <span className="subcell">Monde {formatEuro(0)}</span>
                </td>
                <td>{formatEuro(row.fiscalLandRevenueInFrance + row.fiscalLandRevenueAbroad)}
                  <span className="subcell">FR {formatEuro(row.fiscalLandRevenueInFrance)}</span>
                  <span className="subcell">Monde {formatEuro(row.fiscalLandRevenueAbroad)}</span>
                </td>
                <td>{formatEuro(row.landDeficitInFrance)}
                  <span className="subcell">FR {formatEuro(row.landDeficitInFrance)}</span>
                  <span className="subcell">Monde {formatEuro(0)}</span>
                </td>
                <td>{formatEuro(row.nonScpiTaxableIncome)}</td>
                <td>{formatEuro(row.worldGrossIncome)}</td>
                <td>{formatEuro(row.nonScpiTaxableIncomeDeductions)}</td>
                <td>{formatEuro(row.worldTaxableIncome)}</td>
                <td>{formatEuro(row.theoreticalTaxesOnWorldInFrance)}
                  <span className="subcell">TMI {formatPercent(row.franceTheoreticalAverageIncomeTaxRate )}</span>
                </td>
                <td>{formatEuro(row.frenchTaxCreditToRemoveDoubleTaxes)}</td>
                <td>{formatEuro(row.allIncomeTaxesPaidInFrance)}
                  <span className="subcell">TMI {formatPercent(row.franceAverageIncomeTaxRate )}</span>
                </td>
                <td>{formatEuro(row.socialContributionsFrance)}</td>
                <td>{formatEuro(row.scpiTaxesPaidAbroad)}</td>
                <td>{formatEuro(row.yearlyTotalTaxesPaid)}
                  <span className="subcell">TMI {formatPercent(row.worldAverageTaxRate)}</span>                  
                </td>
                <td>{formatEuro(row.scpiTaxesPaid)}               
                    <span className="subcell">TMI SCPI {formatPercent(row.scpiAverageTaxRate)}</span>
                   </td>
                <td> {formatEuro(row.scpiFullFrenchScenarioFiscalImpact)}
                  <span className="subcell">{formatEuro(row.scpiFullFrenchScenarioTotalTaxes)} impots, TMI {formatPercent(row.scpiFullFrenchScenarioAverageTaxRate)}, TMI SCPI {formatPercent(row.scpiFullFrenchScenarioAverageScpiTaxRate)}</span>
                </td>
              </tr>
            ))}
            </tbody>
        </table>
    </div>
    </section>
  );
}