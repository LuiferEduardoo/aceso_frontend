import { useParams } from 'react-router'
import { RoutineEditorContainer } from '../components/routines/RoutineEditorContainer'

export function RoutineEditorPage() {
  const { routineId } = useParams()
  const id = routineId ? Number(routineId) : undefined
  return <RoutineEditorContainer key={routineId ?? 'new'} routineId={id} />
}
