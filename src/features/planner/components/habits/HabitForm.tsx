import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { isoDate, numberToInput, optionalNumber, optionalText, requiredNumber } from '@/shared/lib/forms'
import { Button, Checkbox, ErrorMessage, Input, Select, Textarea } from '@/shared/ui'
import {
  HABIT_FREQUENCIES,
  HABIT_FREQUENCY_LABELS,
  PLANNER_TIMEZONE,
  type Habit,
  type HabitCreate,
} from '../../api/types'
import { WeekdayPicker } from './WeekdayPicker'

function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value })
    return true
  } catch {
    return false
  }
}

const schema = z
  .object({
    name: z.string().trim().min(1, 'El nombre es obligatorio').max(100, 'Usa como máximo 100 caracteres'),
    description: optionalText,
    frequency: z.enum(HABIT_FREQUENCIES as [Habit['frequency'], ...Habit['frequency'][]]),
    weekdays: z.array(z.number().int().min(0).max(6)),
    times_per_week: optionalNumber(z.number().int('Usa un número entero').min(1, 'Entre 1 y 7').max(7, 'Entre 1 y 7')),
    target_count: requiredNumber(z.number({ error: 'Indica un número' }).int('Usa un número entero').min(1, 'Debe ser al menos 1')),
    unit: optionalText,
    start_date: isoDate,
    time_of_day: optionalText,
    duration_min: optionalNumber(z.number().int('Usa un número entero').positive('Debe ser positivo')),
    timezone: z.string().trim().refine(isTimeZone, 'Zona horaria desconocida (p. ej. America/Bogota)'),
    sync_to_calendar: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.frequency === 'weekdays' && v.weekdays.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['weekdays'], message: 'Elige al menos un día' })
    }
    if (v.frequency === 'times_per_week' && v.times_per_week === undefined) {
      ctx.addIssue({ code: 'custom', path: ['times_per_week'], message: 'Indica cuántas veces por semana' })
    }
    if (v.sync_to_calendar && !v.time_of_day) {
      ctx.addIssue({ code: 'custom', path: ['time_of_day'], message: 'Indica una hora para sincronizar con el calendario' })
    }
  })

const FREQUENCY_OPTIONS = HABIT_FREQUENCIES.map((value) => ({ value, label: HABIT_FREQUENCY_LABELS[value] }))

interface HabitFormProps {
  initial?: Habit
  defaultStartDate: string
  pending: boolean
  error: unknown
  onSubmit: (body: HabitCreate) => void
  onCancel: () => void
}

/** Presentational habit editor; sends every field so PATCH and POST share the payload. */
export function HabitForm({ initial, defaultStartDate, pending, error, onSubmit, onCancel }: HabitFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      frequency: initial?.frequency ?? 'daily',
      weekdays: initial?.weekdays ?? [],
      times_per_week: numberToInput(initial?.times_per_week),
      target_count: numberToInput(initial?.target_count ?? 1),
      unit: initial?.unit ?? '',
      start_date: initial?.start_date ?? defaultStartDate,
      time_of_day: initial?.time_of_day?.slice(0, 5) ?? '',
      duration_min: numberToInput(initial?.duration_min),
      timezone: initial?.timezone ?? PLANNER_TIMEZONE,
      sync_to_calendar: initial?.sync_to_calendar ?? false,
    },
  })
  const frequency = useWatch({ control, name: 'frequency' })

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={handleSubmit((v) =>
        onSubmit({
          name: v.name,
          description: v.description ?? null,
          frequency: v.frequency,
          weekdays: v.frequency === 'weekdays' ? v.weekdays : [],
          times_per_week: v.frequency === 'times_per_week' ? (v.times_per_week ?? null) : null,
          target_count: v.target_count,
          unit: v.unit ?? null,
          start_date: v.start_date,
          time_of_day: v.time_of_day ?? null,
          duration_min: v.duration_min ?? null,
          timezone: v.timezone,
          sync_to_calendar: v.sync_to_calendar,
        }),
      )}
    >
      <Input label="Nombre" error={errors.name?.message} {...register('name')} />
      <Textarea label="Descripción" {...register('description')} />
      <Select label="Frecuencia" options={FREQUENCY_OPTIONS} {...register('frequency')} />
      {frequency === 'weekdays' && (
        <Controller
          control={control}
          name="weekdays"
          render={({ field }) => (
            <WeekdayPicker value={field.value} onChange={field.onChange} error={errors.weekdays?.message} />
          )}
        />
      )}
      {frequency === 'times_per_week' && (
        <Input
          label="Veces por semana"
          type="number"
          min={1}
          max={7}
          error={errors.times_per_week?.message}
          {...register('times_per_week')}
        />
      )}
      <div className="grid grid-cols-2 gap-2">
        <Input label="Meta diaria" type="number" min={1} error={errors.target_count?.message} {...register('target_count')} />
        <Input label="Unidad" placeholder="vasos, páginas…" {...register('unit')} />
        <Input label="Fecha de inicio" type="date" error={errors.start_date?.message} {...register('start_date')} />
        <Input label="Hora" type="time" error={errors.time_of_day?.message} {...register('time_of_day')} />
        <Input label="Duración (min)" type="number" min={1} error={errors.duration_min?.message} {...register('duration_min')} />
        <Input label="Zona horaria" error={errors.timezone?.message} {...register('timezone')} />
      </div>
      <Checkbox label="Sincronizar con Google Calendar" {...register('sync_to_calendar')} />
      <ErrorMessage error={error} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {initial ? 'Guardar hábito' : 'Crear hábito'}
        </Button>
      </div>
    </form>
  )
}
