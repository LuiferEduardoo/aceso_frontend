import { useState } from 'react'
import { Button, Card, EmptyState, ErrorMessage, Modal, QueryBoundary, Select } from '@/shared/ui'
import { TASK_STATUSES, TASK_STATUS_LABELS, type Task, type TaskCreate, type TaskStatus } from '../../api/types'
import { useCompleteTask, useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '../../hooks/useTasks'
import { TaskForm } from './TaskForm'
import { TaskList } from './TaskList'

type Editing = { mode: 'create' } | { mode: 'edit'; task: Task } | null

const STATUS_FILTER_OPTIONS = TASK_STATUSES.map((value) => ({ value, label: TASK_STATUS_LABELS[value] }))

export function TasksContainer() {
  const [status, setStatus] = useState<TaskStatus | undefined>()
  const tasks = useTasks({ status })
  const create = useCreateTask()
  const update = useUpdateTask()
  const remove = useDeleteTask()
  const complete = useCompleteTask()
  const [editing, setEditing] = useState<Editing>(null)

  const mutation = editing?.mode === 'edit' ? update : create
  const close = () => {
    setEditing(null)
    create.reset()
    update.reset()
  }
  const submit = (body: TaskCreate) => {
    if (editing?.mode === 'edit') update.mutate({ id: editing.task.id, body }, { onSuccess: close })
    else create.mutate(body, { onSuccess: close })
  }

  return (
    <Card title="Tareas" actions={<Button onClick={() => setEditing({ mode: 'create' })}>Nueva tarea</Button>}>
      <div className="flex flex-col gap-3">
        <div className="max-w-xs">
          <Select
            label="Filtrar por estado"
            placeholder="Todas"
            options={STATUS_FILTER_OPTIONS}
            value={status ?? ''}
            onChange={(e) => setStatus((e.target.value || undefined) as TaskStatus | undefined)}
          />
        </div>
        <ErrorMessage error={complete.error ?? remove.error} />
        <QueryBoundary query={tasks}>
          {(list) =>
            list.length === 0 ? (
              <EmptyState title="No hay tareas" description="Crea una tarea y, si quieres, prográmala en el calendario." />
            ) : (
              <TaskList
                tasks={list}
                busyId={complete.isPending ? (complete.variables?.id ?? null) : null}
                onComplete={(task, done) => complete.mutate({ id: task.id, done })}
                onEdit={(task) => setEditing({ mode: 'edit', task })}
                onDelete={(task) => remove.mutate(task.id)}
              />
            )
          }
        </QueryBoundary>
      </div>
      <Modal open={editing !== null} title={editing?.mode === 'edit' ? 'Editar tarea' : 'Nueva tarea'} onClose={close}>
        {editing && (
          <TaskForm
            initial={editing.mode === 'edit' ? editing.task : undefined}
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
