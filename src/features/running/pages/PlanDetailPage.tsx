import { useParams } from 'react-router'
import { PlanDetailContainer } from '../components/plans/PlanDetailContainer'

export function PlanDetailPage() {
  const { planId } = useParams()
  return <PlanDetailContainer key={planId} planId={Number(planId)} />
}
