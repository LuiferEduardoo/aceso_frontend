import { useMemo, useState } from 'react'
import { todayIn } from '@/shared/lib/dates'
import { Button, Card, Checkbox, EmptyState, ErrorMessage, Modal, QueryBoundary } from '@/shared/ui'
import { PLANNER_TIMEZONE, type AgendaHabit, type Habit, type HabitCreate } from '../../api/types'
import { useAgenda } from '../../hooks/useAgenda'
import {
  useArchiveHabit,
  useCreateHabit,
  useDeleteHabit,
  useHabits,
  useToggleHabitDay,
  useUpdateHabit,
} from '../../hooks/useHabits'
import { HabitForm } from './HabitForm'
import { HabitList } from './HabitList'

type Editing = { mode: 'create' } | { mode: 'edit'; habit: Habit } | null

export function HabitsContainer() {
  const [includeArchived, setIncludeArchived] = useState(false)
  const habits = useHabits(includeArchived)
  const day = todayIn(PLANNER_TIMEZONE)
  // The agenda knows which habits are expected today and whether they are done.
  const agenda = useAgenda({ from: day, to: day })
  const create = useCreateHabit()
  const update = useUpdateHabit()
  const remove = useDeleteHabit()
  const archive = useArchiveHabit()
  const toggle = useToggleHabitDay()
  const [editing, setEditing] = useState<Editing>(null)

  const today = useMemo(() => {
    const map = new Map<number, AgendaHabit>()
    for (const occurrence of agenda.data?.[0]?.habits ?? []) map.set(occurrence.habit_id, occurrence)
    return map
  }, [agenda.data])

  const mutation = editing?.mode === 'edit' ? update : create
  const close = () => {
    setEditing(null)
    create.reset()
    update.reset()
  }
  const submit = (body: HabitCreate) => {
    if (editing?.mode === 'edit') update.mutate({ id: editing.habit.id, body }, { onSuccess: close })
    else create.mutate(body, { onSuccess: close })
  }

  return (
    <Card
      title="Hábitos"
      actions={
        <>
          <Checkbox label="Mostrar archivados" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} />
          <Button onClick={() => setEditing({ mode: 'create' })}>Nuevo hábito</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <ErrorMessage error={toggle.error ?? archive.error ?? remove.error ?? agenda.error} />
        <QueryBoundary query={habits}>
          {(list) =>
            list.length === 0 ? (
              <EmptyState title="Aún no hay hábitos" description="Crea un hábito y marca cada día que lo cumplas." />
            ) : (
              <HabitList
                habits={list}
                today={today}
                togglingId={toggle.isPending ? (toggle.variables?.id ?? null) : null}
                onToggleToday={(habit, done) =>
                  toggle.mutate({ id: habit.id, day, done, count: habit.target_count })
                }
                onEdit={(habit) => setEditing({ mode: 'edit', habit })}
                onArchive={(habit, archived) => archive.mutate({ id: habit.id, archived })}
                onDelete={(habit) => remove.mutate(habit.id)}
              />
            )
          }
        </QueryBoundary>
      </div>
      <Modal open={editing !== null} title={editing?.mode === 'edit' ? 'Editar hábito' : 'Nuevo hábito'} onClose={close}>
        {editing && (
          <HabitForm
            initial={editing.mode === 'edit' ? editing.habit : undefined}
            defaultStartDate={day}
            pending={mutation.isPending}
            error={mutation.error}
            onCancel={close}
            onSubmit={submit}
          />
        )}
      </Modal>
    </Card>
  )
}
