import { addDays, format, parseISO } from 'date-fns'
import { useState } from 'react'
import { formatDateTime, formatDistance } from '@/shared/lib/format'
import { Button, EmptyState, ErrorMessage, QueryBoundary, Select } from '@/shared/ui'
import type { PlannedRun } from '../../api/types'
import { useActivities } from '../../hooks/useActivities'
import { useUpdatePlannedRun } from '../../hooks/usePlans'

const WINDOW_DAYS = 7

/** Container: lists activities near the planned date and links the chosen one. */
export function LinkActivityContainer({ run, onDone }: { run: PlannedRun; onDone: () => void }) {
  const date = parseISO(run.scheduled_date)
  const range = {
    from: format(addDays(date, -WINDOW_DAYS), 'yyyy-MM-dd'),
    to: format(addDays(date, WINDOW_DAYS), 'yyyy-MM-dd'),
  }
  const activities = useActivities(range)
  const update = useUpdatePlannedRun()
  const [selected, setSelected] = useState('')

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-500">
        Actividades del {range.from} al {range.to}.
      </p>
      <QueryBoundary query={activities}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState title="No hay actividades en este periodo" description="Primero sincroniza Strava desde la sección Actividades." />
          ) : (
            <Select
              label="Actividad"
              placeholder="Selecciona…"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              options={list.map((a) => ({
                value: String(a.id),
                label: `${formatDateTime(a.start_at)} · ${a.name ?? a.sport_type} · ${formatDistance(a.distance_m)}`,
              }))}
            />
          )
        }
      </QueryBoundary>
      <ErrorMessage error={update.error} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button
          disabled={!selected}
          loading={update.isPending}
          onClick={() =>
            update.mutate({ id: run.id, body: { completed_activity_id: Number(selected) } }, { onSuccess: onDone })
          }
        >
          Vincular
        </Button>
      </div>
    </div>
  )
}
