import type { YearlyResult } from '../types/simulation'

interface ProjectionChartProps {
  rows: YearlyResult[]
}

const CHART_WIDTH = 1100
const CHART_HEIGHT = 380
const MARGIN = {
  top: 22,
  right: 58,
  bottom: 52,
  left: 58,
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function makeTicks(min: number, max: number, count: number): number[] {
  if (count <= 1 || min === max) {
    return [min]
  }

  const step = (max - min) / (count - 1)
  return Array.from({ length: count }, (_, index) => min + index * step)
}

export function ProjectionChart({ rows }: ProjectionChartProps) {
  if (rows.length === 0) {
    return null
  }

  const chartInnerWidth = CHART_WIDTH - MARGIN.left - MARGIN.right
  const chartInnerHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom

  const count = rows.length
  const stepX = count > 1 ? chartInnerWidth / (count - 1) : 0

  const leftRawMax = Math.max(
    1,
    ...rows.map((row) => Math.max(row.loanRemainingCapital, row.endOfYearFixedAssetsValuation, row.endofYearLatentProfit)),
  )
  const leftRawMin = Math.min(0, ...rows.map((row) => row.endofYearLatentProfit))
  const leftAbsMax = Math.max(leftRawMax, Math.abs(leftRawMin))
  const leftMax = leftAbsMax
  const leftMin = -leftAbsMax

  const invertedEfforts = rows.map((row) => -row.effortAmount)
  const effortRawMin = Math.min(0, ...invertedEfforts) * 1.3
  const effortRawMax = Math.max(0, ...invertedEfforts) * 1.3
  const effortAbsMax = Math.max(Math.abs(effortRawMin), Math.abs(effortRawMax), 1)
  const effortMax = effortAbsMax
  const effortMin = -effortAbsMax

  const zeroY = MARGIN.top + chartInnerHeight / 2
  const halfSpan = Math.max(1, chartInnerHeight / 2)

  const leftY = (value: number) => {
    if (value >= 0) {
      return zeroY - (value / (leftMax || 1)) * halfSpan
    }
    return zeroY + (Math.abs(value) / (Math.abs(leftMin) || 1)) * halfSpan
  }

  const rightY = (value: number) => {
    if (value >= 0) {
      return zeroY - (value / (effortMax || 1)) * halfSpan
    }
    return zeroY + (Math.abs(value) / (Math.abs(effortMin) || 1)) * halfSpan
  }

  const band = count > 1 ? stepX : chartInnerWidth
  const maxBarWidth = 14
  const barWidth = clamp(band * 0.22, 8, maxBarWidth)
  const barGap = 4

  const points = rows
    .map((row, index) => {
      const x = MARGIN.left + index * stepX
      return `${x},${rightY(-row.effortAmount)}`
    })
    .join(' ')

  const leftTicks = makeTicks(leftMin, leftMax, 6)
  const rightTicks = makeTicks(effortMin, effortMax, 6)

  const xTickStep = count > 12 ? Math.ceil(count / 12) : 1

  return (
    <section className="panel chart-panel" aria-label="Graphe de projection annuelle">
      <h2>Graphe de projection annuelle</h2>     

      <div className="chart-legend">
        <span className="legend-item legend-red">Dettes</span>
        <span className="legend-item legend-green">Valeur des parts</span>
        <span className="legend-item legend-blue">Profit cumulé total (loyers et plus values potentielles)</span>
        <span className="legend-item legend-line">Bénéfice net d'impôts de l'année</span>
      </div>

      <div className="chart-wrap">
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="Graphique annuel">
          <line
            x1={MARGIN.left}
            y1={zeroY}
            x2={MARGIN.left + chartInnerWidth}
            y2={zeroY}
            className="chart-axis"
          />
          <line
            x1={MARGIN.left}
            y1={MARGIN.top}
            x2={MARGIN.left}
            y2={MARGIN.top + chartInnerHeight}
            className="chart-axis"
          />
          <line
            x1={MARGIN.left + chartInnerWidth}
            y1={MARGIN.top}
            x2={MARGIN.left + chartInnerWidth}
            y2={MARGIN.top + chartInnerHeight}
            className="chart-axis"
          />

          {leftTicks.map((tick) => {
            const y = leftY(tick)
            return (
              <g key={`left-${tick}`}>
                <line
                  x1={MARGIN.left}
                  y1={y}
                  x2={MARGIN.left + chartInnerWidth}
                  y2={y}
                  className="chart-grid"
                />
                <text x={MARGIN.left - 10} y={y + 4} textAnchor="end" className="chart-label">
                  {Math.round(tick / 1000)}k
                </text>
              </g>
            )
          })}

          {rightTicks.map((tick) => {
            const y = rightY(tick)
            return (
              <text key={`right-${tick}`} x={MARGIN.left + chartInnerWidth + 10} y={y + 4} className="chart-label">
                {Math.round(tick / 1000)}k
              </text>
            )
          })}

          {effortMin < 0 && effortMax > 0 && (
            <line
              x1={MARGIN.left}
              y1={zeroY}
              x2={MARGIN.left + chartInnerWidth}
              y2={zeroY}
              className="chart-zero"
            />
          )}

          {rows.map((row, index) => {
            const xCenter = MARGIN.left + index * stepX
            const loanY = leftY(row.loanRemainingCapital)
            const assetY = leftY(row.endOfYearFixedAssetsValuation)
            const globalProfitY = leftY(row.endofYearLatentProfit)
            const loanTop = Math.min(loanY, zeroY)
            const assetTop = Math.min(assetY, zeroY)
            const globalProfitTop = Math.min(globalProfitY, zeroY)
            const loanHeight = Math.max(1, Math.abs(zeroY - loanY))
            const assetHeight = Math.max(1, Math.abs(zeroY - assetY))
            const globalProfitHeight = Math.max(1, Math.abs(zeroY - globalProfitY))

            return (
              <g key={row.year}>
                <rect
                  x={xCenter - barWidth * 1.5 - barGap}
                  y={loanTop}
                  width={barWidth}
                  height={loanHeight}
                  className="chart-bar-red"
                />
                <rect
                  x={xCenter - barWidth / 2}
                  y={assetTop}
                  width={barWidth}
                  height={assetHeight}
                  className="chart-bar-green"
                />
                <rect
                  x={xCenter + barWidth / 2 + barGap}
                  y={globalProfitTop}
                  width={barWidth}
                  height={globalProfitHeight}
                  className="chart-bar-blue"
                />

                {(index % xTickStep === 0 || index === rows.length - 1) && (
                  <text x={xCenter} y={MARGIN.top + chartInnerHeight + 18} textAnchor="middle" className="chart-label">
                    {row.year}
                  </text>
                )}
              </g>
            )
          })}

          <polyline points={points} className="chart-line" />
          {rows.map((row, index) => {
            const x = MARGIN.left + index * stepX
            const y = rightY(-row.effortAmount)
            return <circle key={`point-${row.year}`} cx={x} cy={y} r={2.5} className="chart-point" />
          })}

          <text x={MARGIN.left + chartInnerWidth / 2} y={CHART_HEIGHT - 10} textAnchor="middle" className="chart-label">
            Temps (annees)
          </text>
        </svg>
      </div>
    </section>
  )
}
