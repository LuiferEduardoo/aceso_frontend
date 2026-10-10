import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { useMemo } from 'react'
import type { DateRange } from '@/shared/lib/dates'
import { formatDate, formatDistance, formatNumber } from '@/shared/lib/format'
import { Card, DataTable, EmptyState, QueryBoundary, type Column } from '@/shared/ui'
import { HEALTH_SOURCE_LABELS, type DailySummary, type HealthSource } from '../api/types'
import { useDailySummaries } from '../hooks/useHealth'
import { DailyBarChart } from './charts/DailyBarChart'
import { TimeLineChart } from './charts/TimeLineChart'

const COLUMNS: Column<DailySummary>[] = [
  { header: 'Día', cell: (s) => formatDate(s.day) },
  { header: 'Origen', cell: (s) => HEALTH_SOURCE_LABELS[s.source] },
  { header: 'Pasos', cell: (s) => formatNumber(s.steps) },
  { header: 'Distancia', cell: (s) => formatDistance(s.distance_m) },
  { header: 'kcal activas', cell: (s) => formatNumber(s.calories_active) },
  { header: 'kcal totales', cell: (s) => formatNumber(s.calories_total) },
  { header: 'Min activos', cell: (s) => formatNumber(s.active_minutes) },
  { header: 'FC en reposo', cell: (s) => formatNumber(s.resting_hr) },
  { header: 'FC media', cell: (s) => formatNumber(s.avg_hr) },
  { header: 'FC máxima', cell: (s) => formatNumber(s.max_hr) },
  { header: 'Estrés', cell: (s) => formatNumber(s.stress_avg) },
]

/** Charts use a single source so days are never double-counted. */
function chartRows(summaries: DailySummary[]) {
  const source = summaries[0]?.source
  const rows = summaries
    .filter((s) => s.source === source)
    .sort((a, b) => a.day.localeCompare(b.day))
    .map((s) => ({ label: format(parseISO(s.day), 'd MMM', { locale: es }), steps: s.steps ?? null, restingHr: s.resting_hr ?? null }))
  return { source, rows }
}

function SummariesView({ summaries }: { summaries: DailySummary[] }) {
  const { source, rows } = useMemo(() => chartRows(summaries), [summaries])
  if (summaries.length === 0) return <EmptyState title="No hay resúmenes diarios en este rango" />
  return (
    <div className="flex flex-col gap-4">
      {source && <p className="text-xs text-slate-500">Los gráficos muestran el origen: {HEALTH_SOURCE_LABELS[source]}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-1 text-sm font-medium">Pasos</h3>
          <DailyBarChart label="Pasos" data={rows.map((r) => ({ x: r.label, y: r.steps }))} />
        </div>
        <div>
          <h3 className="mb-1 text-sm font-medium">Frecuencia cardiaca en reposo (lpm)</h3>
          <TimeLineChart label="FC en reposo" data={rows.map((r) => ({ x: r.label, y: r.restingHr }))} />
        </div>
      </div>
      <DataTable rows={summaries} columns={COLUMNS} rowKey={(s) => `${s.day}-${s.source}`} caption="Resúmenes diarios" />
    </div>
  )
}

export function SummariesSection({ range, source }: { range: DateRange; source?: HealthSource }) {
  const summaries = useDailySummaries(range, source)
  return (
    <Card title="Resúmenes diarios">
      <QueryBoundary query={summaries}>{(data) => <SummariesView summaries={data} />}</QueryBoundary>
    </Card>
  )
}
