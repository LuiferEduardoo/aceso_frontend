import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { formatDate, formatDateTime } from '@/shared/lib/format'
import { Badge, Button, Card, ConfirmButton, EmptyState, ErrorMessage, Modal, QueryBoundary } from '@/shared/ui'
import { SESSION_STATUS_LABELS, exerciseOptionLabel, type ExerciseSet, type ExerciseSetInput } from '../../api/types'
import { useExercises } from '../../hooks/useExercises'
import { useDeleteSession, useSession, useSessionMutations } from '../../hooks/useSessions'
import { AddExerciseForm } from './AddExerciseForm'
import { SessionExerciseCard } from './SessionExerciseCard'
import { SessionHeaderForm } from './SessionHeaderForm'
import { SetForm } from './SetForm'

type SetEditing = { sessionExerciseId: number; set?: ExerciseSet } | null

export function SessionDetailContainer({ sessionId }: { sessionId: number }) {
  const navigate = useNavigate()
  const session = useSession(sessionId)
  const exercises = useExercises()
  const mutations = useSessionMutations(sessionId)
  const removeSession = useDeleteSession()
  const [setEditing, setSetEditing] = useState<SetEditing>(null)

  const names = useMemo(() => new Map((exercises.data ?? []).map((e) => [e.id, e.name])), [exercises.data])
  const options = (exercises.data ?? []).map((e) => ({ value: String(e.id), label: exerciseOptionLabel(e) }))
  const setMutation = setEditing?.set ? mutations.updateSet : mutations.addSet

  const closeSetForm = () => {
    setSetEditing(null)
    mutations.addSet.reset()
    mutations.updateSet.reset()
  }

  const saveSet = (body: ExerciseSetInput) => {
    if (!setEditing) return
    if (setEditing.set) mutations.updateSet.mutate({ setId: setEditing.set.id, body }, { onSuccess: closeSetForm })
    else mutations.addSet.mutate({ sessionExerciseId: setEditing.sessionExerciseId, body }, { onSuccess: closeSetForm })
  }

  const actionError =
    mutations.update.error ?? mutations.addExercise.error ?? mutations.removeExercise.error ?? mutations.removeSet.error ?? removeSession.error

  return (
    <QueryBoundary query={session}>
      {(data) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Link to="/gym/sessions" className="text-sm text-emerald-700 underline">
                ← Calendario
              </Link>
              <h1 className="text-2xl font-semibold">Sesión del {formatDate(data.scheduled_date)}</h1>
              <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-500">
                <Badge tone={data.status === 'completed' ? 'success' : data.status === 'skipped' ? 'warning' : 'info'}>
                  {SESSION_STATUS_LABELS[data.status]}
                </Badge>
                <span>Inicio: {formatDateTime(data.started_at)}</span>
                <span>Fin: {formatDateTime(data.finished_at)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!data.started_at && (
                <Button onClick={() => mutations.update.mutate({ started_at: new Date().toISOString() })}>Iniciar</Button>
              )}
              {data.started_at && !data.finished_at && (
                <Button onClick={() => mutations.update.mutate({ finished_at: new Date().toISOString(), status: 'completed' })}>
                  Finalizar
                </Button>
              )}
              <ConfirmButton
                confirmLabel="Eliminar sesión"
                onConfirm={() => removeSession.mutate(sessionId, { onSuccess: () => navigate('/gym/sessions') })}
              >
                Eliminar
              </ConfirmButton>
            </div>
          </div>

          <ErrorMessage error={actionError} />

          <Card title="Detalles">
            <SessionHeaderForm session={data} pending={mutations.update.isPending} onSubmit={(body) => mutations.update.mutate(body)} />
          </Card>

          <Card title="Añadir ejercicio">
            <AddExerciseForm options={options} pending={mutations.addExercise.isPending} onAdd={(body) => mutations.addExercise.mutate(body)} />
          </Card>

          {data.exercises.length === 0 ? (
            <EmptyState title="No hay ejercicios en esta sesión" />
          ) : (
            [...data.exercises]
              .sort((a, b) => a.position - b.position)
              .map((item) => (
                <SessionExerciseCard
                  key={item.id}
                  item={item}
                  name={names.get(item.exercise_id) ?? `Ejercicio #${item.exercise_id}`}
                  onAddSet={() => setSetEditing({ sessionExerciseId: item.id })}
                  onEditSet={(set) => setSetEditing({ sessionExerciseId: item.id, set })}
                  onDeleteSet={(set) => mutations.removeSet.mutate(set.id)}
                  onRemove={() => mutations.removeExercise.mutate(item.id)}
                />
              ))
          )}

          <Modal open={setEditing !== null} title={setEditing?.set ? `Editar serie ${setEditing.set.set_number}` : 'Añadir serie'} onClose={closeSetForm}>
            {setEditing && (
              <SetForm
                key={setEditing.set?.id ?? 'new'}
                initial={setEditing.set}
                pending={setMutation.isPending}
                error={setMutation.error}
                onSubmit={saveSet}
                onCancel={closeSetForm}
              />
            )}
          </Modal>
        </div>
      )}
    </QueryBoundary>
  )
}
