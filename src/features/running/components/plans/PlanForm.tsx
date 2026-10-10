import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { isoDate, optionalText } from '@/shared/lib/forms'
import { Button, ErrorMessage, Input, Textarea } from '@/shared/ui'
import type { TrainingPlan } from '../../api/types'

const schema = z
  .object({
    name: z.string().trim().min(1, 'El nombre es obligatorio').max(100, 'Usa como máximo 100 caracteres'),
    goal: optionalText,
    start_date: isoDate,
    end_date: isoDate,
  })
  .refine((v) => v.end_date >= v.start_date, { message: 'La fecha de fin debe ser igual o posterior a la de inicio', path: ['end_date'] })

export interface PlanFormValues {
  name: string
  goal: string | null
  start_date: string
  end_date: string
}

interface PlanFormProps {
  initial?: TrainingPlan
  pending: boolean
  error: unknown
  onSubmit: (values: PlanFormValues) => void
  onCancel: () => void
}

export function PlanForm({ initial, pending, error, onSubmit, onCancel }: PlanFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      goal: initial?.goal ?? '',
      start_date: initial?.start_date ?? '',
      end_date: initial?.end_date ?? '',
    },
  })

  return (
    <form noValidate className="flex flex-col gap-3" onSubmit={handleSubmit((v) => onSubmit({ ...v, goal: v.goal ?? null }))}>
      <Input label="Nombre" error={errors.name?.message} {...register('name')} />
      <Textarea label="Objetivo" {...register('goal')} />
      <div className="grid grid-cols-2 gap-2">
        <Input label="Fecha de inicio" type="date" error={errors.start_date?.message} {...register('start_date')} />
        <Input label="Fecha de fin" type="date" error={errors.end_date?.message} {...register('end_date')} />
      </div>
      <ErrorMessage error={error} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {initial ? 'Guardar plan' : 'Crear plan'}
        </Button>
      </div>
    </form>
  )
}
