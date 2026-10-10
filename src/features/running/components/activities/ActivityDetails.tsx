import { formatDateTime, formatDistance, formatDuration, formatNumber, formatPace, paceFromSpeed } from '@/shared/lib/format'
import type { Activity } from '../../api/types'

export function ActivityDetails({ activity }: { activity: Activity }) {
  const stats: Array<[string, string]> = [
    ['Inicio', formatDateTime(activity.start_at)],
    ['Tipo', activity.sport_type],
    ['Distancia', formatDistance(activity.distance_m)],
    ['Tiempo en movimiento', formatDuration(activity.moving_time_s)],
    ['Tiempo total', formatDuration(activity.elapsed_time_s)],
    ['Ritmo medio', formatPace(paceFromSpeed(activity.avg_speed))],
    ['Desnivel positivo', formatNumber(activity.elevation_gain_m, ' m')],
    ['FC media', formatNumber(activity.avg_hr, ' bpm')],
    ['FC máxima', formatNumber(activity.max_hr, ' bpm')],
    ['Calorías', formatNumber(activity.calories, ' kcal')],
    ['Origen', `${activity.source} (${activity.external_id})`],
  ]
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-md bg-slate-50 p-3 dark:bg-slate-800">
          <dt className="text-xs uppercase text-slate-500">{label}</dt>
          <dd className="font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
