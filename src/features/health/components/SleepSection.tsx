import { differenceInMinutes, format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'
import type { DateRange } from '@/shared/lib/dates'
import { formatDateTime, formatDuration, formatNumber } from '@/shared/lib/format'
import { Card, DataTable, EmptyState, QueryBoundary, type Column } from '@/shared/ui'
import { HEALTH_SOURCE_LABELS, type HealthSource, type SleepSession } from '../api/types'
import { useSleepSessions } from '../hooks/useHealth'
import { SleepStagesChart } from './charts/SleepStagesChart'

const toHours = (seconds: number | null) => Math.round(((seconds ?? 0) / 3600) * 10) / 10

const COLUMNS: Column<SleepSession>[] = [
  { header: 'Inicio', cell: (s) => formatDateTime(s.start_at) },
  { header: 'Fin', cell: (s) => formatDateTime(s.end_at) },
  { header: 'Duración', cell: (s) => formatDuration(differenceInMinutes(parseISO(s.end_at), parseISO(s.start_at)) * 60) },
  { header: 'Profundo', cell: (s) => formatDuration(s.deep_s) },
  { header: 'Ligero', cell: (s) => formatDuration(s.light_s) },
  { header: 'REM', cell: (s) => formatDuration(s.rem_s) },
  { header: 'Despierto', cell: (s) => formatDuration(s.awake_s) },
  { header: 'Puntuación', cell: (s) => formatNumber(s.score) },
  { header: 'Origen', cell: (s) => HEALTH_SOURCE_LABELS[s.source] },
]

function SleepView({ sessions }: { sessions: SleepSession[] }) {
  if (sessions.length === 0) return <EmptyState title="No hay sesiones de sueño en este rango" />
  const data = [...sessions]
    .sort((a, b) => a.end_at.localeCompare(b.end_at))
    .map((s) => ({
      night: format(parseISO(s.end_at), 'd MMM', { locale: es }),
      deep: toHours(s.deep_s),
      light: toHours(s.light_s),
      rem: toHours(s.rem_s),
      awake: toHours(s.awake_s),
    }))
  return (
    <div className="flex flex-col gap-4">
      <SleepStagesChart data={data} />
      <DataTable rows={sessions} columns={COLUMNS} rowKey={(s) => `${s.start_at}-${s.source}`} caption="Sesiones de sueño" />
    </div>
  )
}

export function SleepSection({ range, source }: { range: DateRange; source?: HealthSource }) {
  const sleep = useSleepSessions(range, source)
  return (
    <Card title="Sueño">
      <QueryBoundary query={sleep}>{(data) => <SleepView sessions={data} />}</QueryBoundary>
    </Card>
  )
}
