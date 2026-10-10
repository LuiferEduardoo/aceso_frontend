import { ActivitiesContainer } from '../components/activities/ActivitiesContainer'
import { StravaPanel } from '../components/activities/StravaPanel'

export function ActivitiesPage() {
  return (
    <div className="flex flex-col gap-4">
      <StravaPanel />
      <ActivitiesContainer />
    </div>
  )
}
