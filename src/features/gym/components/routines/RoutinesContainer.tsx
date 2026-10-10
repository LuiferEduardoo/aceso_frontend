import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Card, EmptyState, ErrorMessage, Modal, QueryBoundary } from '@/shared/ui'
import type { Routine } from '../../api/types'
import { useExercises } from '../../hooks/useExercises'
import { useApplyRoutine, useDeleteRoutine, useRoutines } from '../../hooks/useRoutines'
import { ApplyRoutineForm } from './ApplyRoutineForm'
import { RoutineList } from './RoutineList'

export function RoutinesContainer() {
  const navigate = useNavigate()
  const routines = useRoutines()
  const exercises = useExercises()
  const remove = useDeleteRoutine()
  const apply = useApplyRoutine()
  const [applying, setApplying] = useState<Routine | null>(null)

  const names = useMemo(() => new Map((exercises.data ?? []).map((e) => [e.id, e.name])), [exercises.data])

  const closeApply = () => {
    setApplying(null)
    apply.reset()
  }

  return (
    <Card
      title="Rutinas"
      actions={
        <Link to="/gym/routines/new" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Nueva rutina
        </Link>
      }
    >
      <ErrorMessage error={remove.error} title="No se pudo eliminar la rutina" />
      <QueryBoundary query={routines}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState title="Aún no hay rutinas" description="Agrupa ejercicios en una rutina reutilizable." />
          ) : (
            <RoutineList
              routines={list}
              exerciseNames={names}
              onApply={setApplying}
              onDelete={(routine) => remove.mutate(routine.id)}
            />
          )
        }
      </QueryBoundary>
      <Modal open={applying !== null} title={`Aplicar "${applying?.name ?? ''}"`} onClose={closeApply}>
        {applying && (
          <ApplyRoutineForm
            pending={apply.isPending}
            error={apply.error}
            onCancel={closeApply}
            onSubmit={(values) =>
              apply.mutate(
                { id: applying.id, ...values },
                { onSuccess: (session) => navigate(`/gym/sessions/${session.id}`) },
              )
            }
          />
        )}
      </Modal>
    </Card>
  )
}
