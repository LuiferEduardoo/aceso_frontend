import { Link } from 'react-router'
import { formatDateTime, formatDistance, formatDuration, formatNumber, formatPace, paceFromSpeed } from '@/shared/lib/format'
import { DataTable, type Column } from '@/shared/ui'
import type { Activity } from '../../api/types'

const COLUMNS: Column<Activity>[] = [
  { header: 'Fecha', cell: (a) => formatDateTime(a.start_at) },
  {
    header: 'Nombre',
    cell: (a) => (
      <Link to={`/running/activities/${a.id}`} className="text-emerald-700 hover:underline">
        {a.name ?? a.sport_type}
      </Link>
    ),
  },
  { header: 'Tipo', cell: (a) => a.sport_type },
  { header: 'Distancia', cell: (a) => formatDistance(a.distance_m) },
  { header: 'Tiempo en movimiento', cell: (a) => formatDuration(a.moving_time_s) },
  { header: 'Ritmo', cell: (a) => formatPace(paceFromSpeed(a.avg_speed)) },
  { header: 'FC media', cell: (a) => formatNumber(a.avg_hr) },
]

export function ActivityTable({ activities }: { activities: Activity[] }) {
  return <DataTable rows={activities} columns={COLUMNS} rowKey={(a) => a.id} caption="Actividades" />
}
