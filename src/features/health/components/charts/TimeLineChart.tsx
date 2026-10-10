import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { axisProps, gridProps, SERIES, tooltipStyle } from './chartTheme'

export interface LinePoint {
  x: string
  y: number | null
}

interface TimeLineChartProps {
  data: LinePoint[]
  label: string
  color?: string
}

/** Single-series line chart with hover crosshair + tooltip. */
export function TimeLineChart({ data, label, color = SERIES[0] }: TimeLineChartProps) {
  return (
    <div className="h-56" role="img" aria-label={`${label} a lo largo del tiempo`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="x" {...axisProps} minTickGap={24} />
          <YAxis {...axisProps} width={48} domain={['auto', 'auto']} />
          <Tooltip {...tooltipStyle} />
          <Line type="monotone" dataKey="y" name={label} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
