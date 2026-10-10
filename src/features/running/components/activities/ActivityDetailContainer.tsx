import { Link } from 'react-router'
import { Card, QueryBoundary } from '@/shared/ui'
import { useActivity } from '../../hooks/useActivities'
import { ActivityDetails } from './ActivityDetails'

export function ActivityDetailContainer({ activityId }: { activityId: number }) {
  const activity = useActivity(activityId)
  return (
    <div className="flex flex-col gap-3">
      <Link to="/running/activities" className="text-sm text-emerald-700 underline">
        ← Actividades
      </Link>
      <QueryBoundary query={activity}>
        {(data) => (
          <Card title={data.name ?? data.sport_type}>
            <ActivityDetails activity={data} />
          </Card>
        )}
      </QueryBoundary>
    </div>
  )
}
