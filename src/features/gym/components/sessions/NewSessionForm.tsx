import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { isoDate, optionalText } from '@/shared/lib/forms'
import { Button, ErrorMessage, Input, Textarea } from '@/shared/ui'

const schema = z.object({ scheduled_date: isoDate, notes: optionalText })

interface NewSessionFormProps {
  defaultDate: string
  pending: boolean
  error: unknown
  onSubmit: (values: { scheduled_date: string; notes: string | null }) => void
  onCancel: () => void
}

export function NewSessionForm({ defaultDate, pending, error, onSubmit, onCancel }: NewSessionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { scheduled_date: defaultDate, notes: '' } })

  return (
    <form noValidate className="flex flex-col gap-3" onSubmit={handleSubmit((v) => onSubmit({ ...v, notes: v.notes ?? null }))}>
      <Input label="Fecha" type="date" error={errors.scheduled_date?.message} {...register('scheduled_date')} />
      <Textarea label="Notas" {...register('notes')} />
      <ErrorMessage error={error} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          Crear sesión
        </Button>
      </div>
    </form>
  )
}
