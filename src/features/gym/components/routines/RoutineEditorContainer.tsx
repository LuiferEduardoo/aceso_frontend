import { useNavigate } from 'react-router'
import { Card, ErrorMessage, Spinner } from '@/shared/ui'
import { exerciseOptionLabel } from '../../api/types'
import { useExercises } from '../../hooks/useExercises'
import { useRoutine, useSaveRoutine } from '../../hooks/useRoutines'
import { RoutineForm } from './RoutineForm'
import { routineToForm } from './routineSchema'

export function RoutineEditorContainer({ routineId }: { routineId?: number }) {
  const navigate = useNavigate()
  const routine = useRoutine(routineId)
  const exercises = useExercises()
  const save = useSaveRoutine()

  if (routine.error || exercises.error) return <ErrorMessage error={routine.error ?? exercises.error} />
  if ((routineId !== undefined && routine.isPending) || exercises.isPending) return <Spinner />

  const options = (exercises.data ?? []).map((e) => ({ value: String(e.id), label: exerciseOptionLabel(e) }))

  return (
    <Card title={routineId === undefined ? 'Nueva rutina' : 'Editar rutina'}>
      <RoutineForm
        defaultValues={routineToForm(routine.data)}
        exerciseOptions={options}
        pending={save.isPending}
        error={save.error}
        submitLabel={routineId === undefined ? 'Crear rutina' : 'Guardar rutina'}
        onCancel={() => navigate('/gym/routines')}
        onSubmit={(body) => save.mutate({ id: routineId, body }, { onSuccess: () => navigate('/gym/routines') })}
      />
    </Card>
  )
}
