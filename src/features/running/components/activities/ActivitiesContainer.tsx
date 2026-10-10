import { useState } from 'react'
import { lastDays } from '@/shared/lib/dates'
import { Card, DateRangePicker, EmptyState, QueryBoundary } from '@/shared/ui'
import { MAX_RANGE_DAYS } from '../../api/types'
import { useActivities } from '../../hooks/useActivities'
import { ActivityTable } from './ActivityTable'

export function ActivitiesContainer() {
  const [range, setRange] = useState(() => lastDays(30))
  const activities = useActivities(range)

  return (
    <Card title="Actividades" actions={<DateRangePicker value={range} onChange={setRange} maxDays={MAX_RANGE_DAYS} />}>
      <QueryBoundary query={activities}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState title="No hay actividades en este rango" description="Conecta y sincroniza Strava para importar tus carreras." />
          ) : (
            <ActivityTable activities={list} />
          )
        }
      </QueryBoundary>
    </Card>
  )
}
