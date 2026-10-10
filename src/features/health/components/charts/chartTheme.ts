/** Shared Recharts styling: recessive grid/axes, palette roles from CSS custom properties. */
export const SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)'] as const

export const axisProps = {
  stroke: 'var(--chart-axis)',
  tick: { fill: 'var(--chart-axis)', fontSize: 12 },
  tickLine: false,
} as const

export const gridProps = { stroke: 'var(--chart-grid)', strokeDasharray: '3 3', vertical: false } as const

export const tooltipStyle = {
  contentStyle: { borderRadius: 6, fontSize: 12, color: '#0f172a' },
} as const
