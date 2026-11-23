import { zodResolver } from '@hookform/resolvers/zod'
import { parseISO } from 'date-fns'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { localInputToIso, toLocalInput } from '@/shared/lib/dates'
import { isoDate, optionalText } from '@/shared/lib/forms'
import { Button, ErrorMessage, Input, Select, Textarea } from '@/shared/ui'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type Task,
  type TaskCreate,
} from '../../api/types'

const schema = z
  .object({
    title: z.string().trim().min(1, 'El título es obligatorio').max(200, 'Usa como máximo 200 caracteres'),
    notes: optionalText,
    status: z.enum(TASK_STATUSES as [Task['status'], ...Task['status'][]]),
    priority: z.enum(TASK_PRIORITIES as [Task['priority'], ...Task['priority'][]]),
    due_date: isoDate.optional().or(z.literal('').transform(() => undefined)),
    scheduled_start: optionalText,
    scheduled_end: optionalText,
  })
  .refine((v) => !v.scheduled_start === !v.scheduled_end, {
    path: ['scheduled_end'],
    message: 'Indica el inicio y el fin, o deja ambos vacíos',
  })
  .refine((v) => !v.scheduled_start || !v.scheduled_end || v.scheduled_end > v.scheduled_start, {
    path: ['scheduled_end'],
    message: 'El fin debe ser posterior al inicio',
  })

const STATUS_OPTIONS = TASK_STATUSES.map((value) => ({ value, label: TASK_STATUS_LABELS[value] }))
const PRIORITY_OPTIONS = TASK_PRIORITIES.map((value) => ({ value, label: TASK_PRIORITY_LABELS[value] }))

const toInput = (iso: string | null | undefined) => (iso ? toLocalInput(parseISO(iso)) : '')

interface TaskFormProps {
  initial?: Task
  pending: boolean
  error: unknown
  onSubmit: (body: TaskCreate) => void
  onCancel: () => void
}

/** Presentational task editor; the optional schedule uses local `datetime-local` inputs. */
export function TaskForm({ initial, pending, error, onSubmit, onCancel }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      notes: initial?.notes ?? '',
      status: initial?.status ?? 'todo',
      priority: initial?.priority ?? 'medium',
      due_date: initial?.due_date ?? '',
      scheduled_start: toInput(initial?.scheduled_start),
      scheduled_end: toInput(initial?.scheduled_end),
    },
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={handleSubmit((v) =>
        onSubmit({
          title: v.title,
          notes: v.notes ?? null,
          status: v.status,
          priority: v.priority,
          due_date: v.due_date ?? null,
          scheduled_start: v.scheduled_start ? localInputToIso(v.scheduled_start) : null,
          scheduled_end: v.scheduled_end ? localInputToIso(v.scheduled_end) : null,
        }),
      )}
    >
      <Input label="Título" error={errors.title?.message} {...register('title')} />
      <Textarea label="Notas" {...register('notes')} />
      <div className="grid grid-cols-2 gap-2">
        <Select label="Estado" options={STATUS_OPTIONS} {...register('status')} />
        <Select label="Prioridad" options={PRIORITY_OPTIONS} {...register('priority')} />
        <Input label="Fecha límite" type="date" error={errors.due_date?.message} {...register('due_date')} />
      </div>
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="col-span-2 mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          Programar en el calendario (opcional)
        </legend>
        <Input label="Inicio" type="datetime-local" error={errors.scheduled_start?.message} {...register('scheduled_start')} />
        <Input label="Fin" type="datetime-local" error={errors.scheduled_end?.message} {...register('scheduled_end')} />
      </fieldset>
      <ErrorMessage error={error} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {initial ? 'Guardar tarea' : 'Crear tarea'}
        </Button>
      </div>
    </form>
  )
}
