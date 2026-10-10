import { Badge, Button, ConfirmButton } from '@/shared/ui'
import { EQUIPMENT_LABELS, EXERCISE_TYPE_LABELS, MUSCLE_GROUP_LABELS, type Exercise } from '../../api/types'
import { ExerciseThumbnail } from './ExerciseThumbnail'

interface ExerciseListProps {
  exercises: Exercise[]
  onEdit: (exercise: Exercise) => void
  onDelete: (exercise: Exercise) => void
}

export function ExerciseList({ exercises, onEdit, onDelete }: ExerciseListProps) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {exercises.map((exercise) => (
        <li key={exercise.id} className="flex flex-wrap items-center gap-3 py-3">
          <ExerciseThumbnail exercise={exercise} />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{exercise.name}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge tone="info">{MUSCLE_GROUP_LABELS[exercise.muscle_group]}</Badge>
              <Badge>{EQUIPMENT_LABELS[exercise.equipment]}</Badge>
              <Badge tone="success">{EXERCISE_TYPE_LABELS[exercise.exercise_type]}</Badge>
            </div>
            {exercise.secondary_muscles.length > 0 && (
              <p className="mt-1 truncate text-sm text-slate-500">
                Secundarios: {exercise.secondary_muscles.map((muscle) => MUSCLE_GROUP_LABELS[muscle]).join(', ')}
              </p>
            )}
            {exercise.instructions && <p className="truncate text-sm text-slate-500">{exercise.instructions}</p>}
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="secondary" onClick={() => onEdit(exercise)}>
              Editar
            </Button>
            <ConfirmButton onConfirm={() => onDelete(exercise)} aria-label={`Eliminar ${exercise.name}`}>
              Eliminar
            </ConfirmButton>
          </div>
        </li>
      ))}
    </ul>
  )
}
