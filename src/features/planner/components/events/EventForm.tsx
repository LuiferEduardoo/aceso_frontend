import { zodResolver } from '@hookform/resolvers/zod'
import { parseISO } from 'date-fns'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { localInputToIso, toLocalInput } from '@/shared/lib/dates'
import { optionalText } from '@/shared/lib/forms'
import { Button, Checkbox, ErrorMessage, Input, Textarea } from '@/shared/ui'
import type { CalendarEvent, CalendarEventCreate } from '../../api/types'

const localDateTime = z.string().min(1, 'Elige fecha y hora')

const schema = z
  .object({
    title: z.string().trim().min(1, 'El título es obligatorio').max(1000, 'Usa como máximo 1000 caracteres'),
    description: optionalText,
    location: optionalText,
    start_at: localDateTime,
    end_at: localDateTime,
    all_day: z.boolean(),
  })
  .refine((v) => !v.start_at || !v.end_at || v.end_at > v.start_at, {
    path: ['end_at'],
    message: 'El fin debe ser posterior al inicio',
  })

interface EventFormProps {
  initial?: CalendarEvent
  /** ISO date used to prefill a new event (09:00–10:00). */
  defaultDate: string
  pending: boolean
  error: unknown
  onSubmit: (body: CalendarEventCreate) => void
  onCancel: () => void
}

export function EventForm({ initial, defaultDate, pending, error, onSubmit, onCancel }: EventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      location: initial?.location ?? '',
      start_at: initial ? toLocalInput(parseISO(initial.start_at)) : `${defaultDate}T09:00`,
      end_at: initial ? toLocalInput(parseISO(initial.end_at)) : `${defaultDate}T10:00`,
      all_day: initial?.all_day ?? false,
    },
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={handleSubmit((v) =>
        onSubmit({
          title: v.title,
          description: v.description ?? null,
          location: v.location ?? null,
          start_at: localInputToIso(v.start_at),
          end_at: localInputToIso(v.end_at),
          all_day: v.all_day,
        }),
      )}
    >
      <Input label="Título" error={errors.title?.message} {...register('title')} />
      <div className="grid grid-cols-2 gap-2">
        <Input label="Inicio" type="datetime-local" error={errors.start_at?.message} {...register('start_at')} />
        <Input label="Fin" type="datetime-local" error={errors.end_at?.message} {...register('end_at')} />
      </div>
      <Checkbox label="Todo el día" {...register('all_day')} />
      <Input label="Ubicación" {...register('location')} />
      <Textarea label="Descripción" {...register('description')} />
      <ErrorMessage error={error} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {initial ? 'Guardar evento' : 'Crear evento'}
        </Button>
      </div>
    </form>
  )
}
