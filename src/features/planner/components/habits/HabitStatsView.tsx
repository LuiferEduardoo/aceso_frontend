import { STREAK_UNIT_LABELS, type HabitStats } from '../../api/types'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-slate-200 p-3 dark:border-slate-700">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-xl font-semibold">{value}</dd>
    </div>
  )
}

export function HabitStatsView({ stats }: { stats: HabitStats }) {
  const unit = STREAK_UNIT_LABELS[stats.streak_unit]
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat label="Racha actual" value={`${stats.current_streak} ${unit}`} />
      <Stat label="Mejor racha" value={`${stats.best_streak} ${unit}`} />
      <Stat label="Cumplidos" value={`${stats.completed} / ${stats.expected}`} />
      <Stat label="Cumplimiento" value={`${Math.round(stats.completion_rate * 100)} %`} />
    </dl>
  )
}
