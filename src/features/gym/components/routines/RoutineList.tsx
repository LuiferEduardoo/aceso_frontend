import { Link } from 'react-router'
import { Button, ConfirmButton } from '@/shared/ui'
import type { Routine } from '../../api/types'

interface RoutineListProps {
  routines: Routine[]
  exerciseNames: Map<number, string>
  onApply: (routine: Routine) => void
  onDelete: (routine: Routine) => void
}

export function RoutineList({ routines, exerciseNames, onApply, onDelete }: RoutineListProps) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {routines.map((routine) => (
        <li key={routine.id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
          <div>
            <p className="font-medium">{routine.name}</p>
            {routine.description && <p className="text-sm text-slate-500">{routine.description}</p>}
          </div>
          <ol className="list-decimal pl-5 text-sm text-slate-600 dark:text-slate-300">
            {[...routine.exercises]
              .sort((a, b) => a.position - b.position)
              .map((item) => (
                <li key={item.id}>
                  {exerciseNames.get(item.exercise_id) ?? `Ejercicio #${item.exercise_id}`}
                  {item.target_sets && item.target_reps ? ` — ${item.target_sets}×${item.target_reps}` : ''}
                  {item.target_weight_kg != null ? ` @ ${item.target_weight_kg} kg` : ''}
                </li>
              ))}
          </ol>
          <div className="mt-auto flex flex-wrap gap-1">
            <Button size="sm" onClick={() => onApply(routine)}>
              Aplicar a una fecha
            </Button>
            <Link
              to={`/gym/routines/${routine.id}`}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-sm dark:border-slate-600"
            >
              Editar
            </Link>
            <ConfirmButton onConfirm={() => onDelete(routine)}>Eliminar</ConfirmButton>
          </div>
        </li>
      ))}
    </ul>
  )
}
