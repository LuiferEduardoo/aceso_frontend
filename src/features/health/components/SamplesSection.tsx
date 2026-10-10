import { differenceInMinutes, format, parseISO, subDays } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { useState, type FormEvent } from 'react'
import { localInputToIso, toLocalInput } from '@/shared/lib/dates'
import { Button, Card, EmptyState, Input, QueryBoundary, Select } from '@/shared/ui'
import { MAX_SAMPLE_RANGE_DAYS, SAMPLE_METRIC_LABELS, SAMPLE_METRICS, type DateTimeRange, type HealthSource, type SampleMetric } from '../api/types'
import { useSamples } from '../hooks/useHealth'
import { TimeLineChart } from './charts/TimeLineChart'

const METRIC_OPTIONS = SAMPLE_METRICS.map((value) => ({ value, label: SAMPLE_METRIC_LABELS[value] }))

function defaultDraft() {
  const now = new Date()
  return { from: toLocalInput(subDays(now, 1)), to: toLocalInput(now) }
}

function toRange(draft: { from: string; to: string }): DateTimeRange {
  return { from: localInputToIso(draft.from), to: localInputToIso(draft.to) }
}

/** Validates the local datetime range against the backend's 31-day sample limit. */
function rangeError(draft: { from: string; to: string }): string | null {
  if (!draft.from || !draft.to) return 'Elige ambas fechas y horas.'
  const minutes = differenceInMinutes(new Date(draft.to), new Date(draft.from))
  if (minutes <= 0) return '"Desde" debe ser anterior a "Hasta".'
  if (minutes > MAX_SAMPLE_RANGE_DAYS * 24 * 60) return `El rango puede abarcar como máximo ${MAX_SAMPLE_RANGE_DAYS} días.`
  return null
}

export function SamplesSection({ source }: { source?: HealthSource }) {
  const [metric, setMetric] = useState<SampleMetric>('heart_rate')
  const [draft, setDraft] = useState(defaultDraft)
  const [range, setRange] = useState(() => toRange(draft))
  const [error, setError] = useState<string | null>(null)
  const samples = useSamples(metric, range, source)

  const apply = (event: FormEvent) => {
    event.preventDefault()
    const problem = rangeError(draft)
    setError(problem)
    if (!problem) setRange(toRange(draft))
  }

  return (
    <Card title="Muestras">
      <form onSubmit={apply} className="mb-4 flex flex-wrap items-end gap-2" aria-label="Filtro de muestras">
        <Select label="Métrica" options={METRIC_OPTIONS} value={metric} onChange={(e) => setMetric(e.target.value as SampleMetric)} />
        <Input label="Desde" type="datetime-local" value={draft.from} onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))} />
        <Input label="Hasta" type="datetime-local" value={draft.to} onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))} />
        <Button type="submit" variant="secondary">
          Aplicar
        </Button>
        {error && (
          <p role="alert" className="w-full text-xs text-red-600">
            {error}
          </p>
        )}
      </form>
      <QueryBoundary query={samples}>
        {(data) =>
          data.length === 0 ? (
            <EmptyState title={`No hay muestras de ${SAMPLE_METRIC_LABELS[metric]} en este rango`} />
          ) : (
            <TimeLineChart
              label={SAMPLE_METRIC_LABELS[metric]}
              data={[...data]
                .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
                .map((s) => ({ x: format(parseISO(s.recorded_at), 'd MMM HH:mm', { locale: es }), y: s.value }))}
            />
          )
        }
      </QueryBoundary>
    </Card>
  )
}
