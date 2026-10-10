import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { today } from '@/shared/lib/dates'
import { isoDate, optionalText } from '@/shared/lib/forms'
import { Button, ErrorMessage, Input, Textarea } from '@/shared/ui'

const schema = z.object({ scheduledDate: isoDate, notes: optionalText })

interface ApplyRoutineFormProps {
  pending: boolean
  error: unknown
  onSubmit: (values: { scheduledDate: string; notes?: string }) => void
  onCancel: () => void
}

export function ApplyRoutineForm({ pending, error, onSubmit, onCancel }: ApplyRoutineFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { scheduledDate: today(), notes: '' } })

  return (
    <form noValidate className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Fecha" type="date" error={errors.scheduledDate?.message} {...register('scheduledDate')} />
      <Textarea label="Notas" {...register('notes')} />
      <ErrorMessage error={error} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          Programar sesión
        </Button>
      </div>
    </form>
  )
}
