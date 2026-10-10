import { useParams } from 'react-router'
import { ActivityDetailContainer } from '../components/activities/ActivityDetailContainer'

export function ActivityDetailPage() {
  const { activityId } = useParams()
  return <ActivityDetailContainer key={activityId} activityId={Number(activityId)} />
}
