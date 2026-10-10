import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { isoDate, optionalText } from '@/shared/lib/forms'
import { Button, Input, Select, Textarea } from '@/shared/ui'
import { SESSION_STATUSES, SESSION_STATUS_LABELS, type WorkoutSession, type WorkoutSessionUpdate } from '../../api/types'

const schema = z.object({
  scheduled_date: isoDate,
  status: z.enum(['planned', 'completed', 'skipped']),
  notes: optionalText,
})

const STATUS_OPTIONS = SESSION_STATUSES.map((value) => ({ value, label: SESSION_STATUS_LABELS[value] }))

interface SessionHeaderFormProps {
  session: WorkoutSession
  pending: boolean
  onSubmit: (body: WorkoutSessionUpdate) => void
}

export function SessionHeaderForm({ session, pending, onSubmit }: SessionHeaderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    values: { scheduled_date: session.scheduled_date, status: session.status, notes: session.notes ?? '' },
  })

  return (
    <form
      noValidate
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={handleSubmit((values) => onSubmit({ ...values, notes: values.notes ?? null }))}
    >
      <Input label="Fecha" type="date" error={errors.scheduled_date?.message} {...register('scheduled_date')} />
      <Select label="Estado" options={STATUS_OPTIONS} {...register('status')} />
      <div className="sm:col-span-2">
        <Textarea label="Notas" {...register('notes')} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" variant="secondary" loading={pending} disabled={!isDirty}>
          Guardar detalles
        </Button>
      </div>
    </form>
  )
}
