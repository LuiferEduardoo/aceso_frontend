import { useParams } from 'react-router'
import { HabitDetailContainer } from '../components/habits/HabitDetailContainer'

export function HabitDetailPage() {
  const { habitId } = useParams()
  return <HabitDetailContainer key={habitId} habitId={Number(habitId)} />
}
