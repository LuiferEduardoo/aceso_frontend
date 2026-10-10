import { Button, Card, ConfirmButton } from '@/shared/ui'
import type { ExerciseSet, SessionExercise } from '../../api/types'
import { SetTable } from './SetTable'

interface SessionExerciseCardProps {
  item: SessionExercise
  name: string
  onAddSet: () => void
  onEditSet: (set: ExerciseSet) => void
  onDeleteSet: (set: ExerciseSet) => void
  onRemove: () => void
}

export function SessionExerciseCard({ item, name, onAddSet, onEditSet, onDeleteSet, onRemove }: SessionExerciseCardProps) {
  return (
    <Card
      title={name}
      actions={
        <>
          <Button size="sm" onClick={onAddSet}>
            Añadir serie
          </Button>
          <ConfirmButton onConfirm={onRemove}>Quitar ejercicio</ConfirmButton>
        </>
      }
    >
      {item.notes && <p className="mb-2 text-sm text-slate-500">{item.notes}</p>}
      {item.sets.length === 0 ? (
        <p className="text-sm text-slate-500">Aún no hay series registradas.</p>
      ) : (
        <SetTable sets={item.sets} onEdit={onEditSet} onDelete={onDeleteSet} />
      )}
    </Card>
  )
}
