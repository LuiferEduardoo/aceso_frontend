import { useState } from 'react'
import { Link } from 'react-router'
import { lastDays } from '@/shared/lib/dates'
import { formatDate } from '@/shared/lib/format'
import { Card, DateRangePicker, QueryBoundary } from '@/shared/ui'
import { describeFrequency, MAX_RANGE_DAYS } from '../../api/types'
import { useHabit, useHabitStats } from '../../hooks/useHabits'
import { HabitStatsView } from './HabitStatsView'

export function HabitDetailContainer({ habitId }: { habitId: number }) {
  const habit = useHabit(habitId)
  const [range, setRange] = useState(() => lastDays(30))
  const stats = useHabitStats(habitId, range)

  return (
    <div className="flex flex-col gap-4">
      <Link to="/planner/habits" className="text-sm text-emerald-700 hover:underline">
        ← Hábitos
      </Link>
      <QueryBoundary query={habit}>
        {(h) => (
          <Card title={h.name}>
            <p className="text-sm text-slate-500">
              {describeFrequency(h)} · desde {formatDate(h.start_date)} · {h.timezone}
            </p>
            {h.description && <p className="mt-2 text-sm">{h.description}</p>}
          </Card>
        )}
      </QueryBoundary>
      <Card title="Estadísticas" actions={<DateRangePicker value={range} onChange={setRange} maxDays={MAX_RANGE_DAYS} />}>
        <QueryBoundary query={stats}>{(data) => <HabitStatsView stats={data} />}</QueryBoundary>
      </Card>
    </div>
  )
}
