import { Link } from 'react-router'
import { formatDate, formatDistance, formatDuration, formatPace } from '@/shared/lib/format'
import { Badge, Button, ConfirmButton } from '@/shared/ui'
import { RUN_TYPE_LABELS, type PlannedRun } from '../../api/types'

interface PlannedRunListProps {
  runs: PlannedRun[]
  planNames?: Map<number, string>
  onEdit?: (run: PlannedRun) => void
  onLink?: (run: PlannedRun) => void
  onUnlink?: (run: PlannedRun) => void
  onDelete?: (run: PlannedRun) => void
}

function targets(run: PlannedRun): string {
  const parts = [
    run.target_distance_m != null && formatDistance(run.target_distance_m),
    run.target_duration_s != null && formatDuration(run.target_duration_s),
    run.target_pace_s_per_km != null && formatPace(run.target_pace_s_per_km),
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : 'Sin objetivos'
}

export function PlannedRunList({ runs, planNames, onEdit, onLink, onUnlink, onDelete }: PlannedRunListProps) {
  const sorted = [...runs].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {sorted.map((run) => (
        <li key={run.id} className="flex flex-wrap items-center gap-3 py-2">
          <div className="w-36 text-sm text-slate-500">{formatDate(run.scheduled_date)}</div>
          <Badge tone="info">{RUN_TYPE_LABELS[run.run_type]}</Badge>
          <div className="min-w-0 flex-1 text-sm">
            <p>{targets(run)}</p>
            {run.description && <p className="text-slate-500">{run.description}</p>}
            {planNames && (
              <Link to={`/running/plans/${run.plan_id}`} className="text-xs text-emerald-700 underline">
                {planNames.get(run.plan_id) ?? `Plan #${run.plan_id}`}
              </Link>
            )}
          </div>
          {run.completed_activity_id ? (
            <Link to={`/running/activities/${run.completed_activity_id}`}>
              <Badge tone="success">Hecha · actividad #{run.completed_activity_id}</Badge>
            </Link>
          ) : (
            <Badge>Pendiente</Badge>
          )}
          <div className="flex flex-wrap gap-1">
            {onLink && !run.completed_activity_id && (
              <Button size="sm" variant="secondary" onClick={() => onLink(run)}>
                Vincular actividad
              </Button>
            )}
            {onUnlink && run.completed_activity_id && (
              <Button size="sm" variant="ghost" onClick={() => onUnlink(run)}>
                Desvincular
              </Button>
            )}
            {onEdit && (
              <Button size="sm" variant="secondary" onClick={() => onEdit(run)}>
                Editar
              </Button>
            )}
            {onDelete && <ConfirmButton onConfirm={() => onDelete(run)}>Eliminar</ConfirmButton>}
          </div>
        </li>
      ))}
    </ul>
  )
}
