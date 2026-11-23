import { formatDate, formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'
import { Badge, Button, ConfirmButton } from '@/shared/ui'
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, type Task, type TaskStatus } from '../../api/types'

const STATUS_TONES: Record<TaskStatus, 'neutral' | 'success' | 'warning' | 'info'> = {
  todo: 'neutral',
  in_progress: 'info',
  done: 'success',
  cancelled: 'warning',
}

interface TaskListProps {
  tasks: Task[]
  busyId: number | null
  onComplete: (task: Task, done: boolean) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskList({ tasks, busyId, onComplete, onEdit, onDelete }: TaskListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => {
        const done = task.status === 'done'
        return (
          <li
            key={task.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700"
          >
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('font-medium', done && 'text-slate-500 line-through')}>{task.title}</span>
                <Badge tone={STATUS_TONES[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
                <Badge>Prioridad {TASK_PRIORITY_LABELS[task.priority].toLowerCase()}</Badge>
              </div>
              <p className="text-sm text-slate-500">
                {task.due_date && `Vence ${formatDate(task.due_date)}`}
                {task.due_date && task.scheduled_start && ' · '}
                {task.scheduled_start && `${formatDateTime(task.scheduled_start)} → ${formatDateTime(task.scheduled_end)}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={done ? 'ghost' : 'primary'} loading={busyId === task.id} onClick={() => onComplete(task, !done)}>
                {done ? 'Reabrir' : 'Completar'}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onEdit(task)}>
                Editar
              </Button>
              <ConfirmButton onConfirm={() => onDelete(task)}>Eliminar</ConfirmButton>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
