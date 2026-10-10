import { addDays } from 'date-fns'
import { useMemo, useState } from 'react'
import { lastDays, toIsoDate, type DateRange } from '@/shared/lib/dates'
import { Card, DateRangePicker, EmptyState, ErrorMessage, QueryBoundary } from '@/shared/ui'
import { MAX_RANGE_DAYS } from '../../api/types'
import { usePlannedRuns, usePlans, useUpdatePlannedRun } from '../../hooks/usePlans'
import { PlannedRunList } from './PlannedRunList'

function defaultRange(): DateRange {
  const past = lastDays(7)
  return { from: past.from, to: toIsoDate(addDays(new Date(), 28)) }
}

/** Container: planned runs across all plans for a chosen date range. */
export function PlannedRunsContainer() {
  const [range, setRange] = useState(defaultRange)
  const runs = usePlannedRuns(range)
  const plans = usePlans()
  const update = useUpdatePlannedRun()
  const names = useMemo(() => new Map((plans.data ?? []).map((p) => [p.id, p.name])), [plans.data])

  return (
    <Card title="Calendario" actions={<DateRangePicker value={range} onChange={setRange} maxDays={MAX_RANGE_DAYS} />}>
      <ErrorMessage error={update.error} />
      <QueryBoundary query={runs}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState title="No hay carreras planificadas en este rango" />
          ) : (
            <PlannedRunList
              runs={list}
              planNames={names}
              onUnlink={(run) => update.mutate({ id: run.id, body: { completed_activity_id: null } })}
            />
          )
        }
      </QueryBoundary>
    </Card>
  )
}
