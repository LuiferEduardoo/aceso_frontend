import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { axisProps, gridProps, SERIES, tooltipStyle } from './chartTheme'

export interface SleepStagesPoint {
  night: string
  deep: number
  light: number
  rem: number
  awake: number
}

const STAGES = [
  { key: 'deep', label: 'Profundo' },
  { key: 'light', label: 'Ligero' },
  { key: 'rem', label: 'REM' },
  { key: 'awake', label: 'Despierto' },
] as const

/** Stacked hours per sleep stage, one bar per night, with a legend. */
export function SleepStagesChart({ data }: { data: SleepStagesPoint[] }) {
  return (
    <div className="h-64" role="img" aria-label="Fases del sueño por noche, en horas">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="night" {...axisProps} />
          <YAxis {...axisProps} width={40} unit="h" />
          <Tooltip {...tooltipStyle} cursor={{ fill: 'var(--chart-grid)', opacity: 0.4 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {STAGES.map((stage, index) => (
            <Bar
              key={stage.key}
              dataKey={stage.key}
              name={stage.label}
              stackId="sleep"
              fill={SERIES[index]}
              stroke="var(--chart-surface)"
              strokeWidth={1}
              maxBarSize={28}
              radius={index === STAGES.length - 1 ? [4, 4, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
