import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { axisProps, gridProps, SERIES, tooltipStyle } from './chartTheme'

export interface BarPoint {
  x: string
  y: number | null
}

/** Single-series bar chart for one daily magnitude; the card title names the series. */
export function DailyBarChart({ data, label }: { data: BarPoint[]; label: string }) {
  return (
    <div className="h-56" role="img" aria-label={`${label} por día`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="x" {...axisProps} />
          <YAxis {...axisProps} width={48} />
          <Tooltip {...tooltipStyle} cursor={{ fill: 'var(--chart-grid)', opacity: 0.4 }} />
          <Bar dataKey="y" name={label} fill={SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
