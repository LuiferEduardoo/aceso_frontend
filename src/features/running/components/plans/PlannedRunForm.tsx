import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { parseClock, toClock } from '@/shared/lib/clock'
import { isoDate, optionalNumber, optionalText } from '@/shared/lib/forms'
import { Button, ErrorMessage, Input, Select, Textarea } from '@/shared/ui'
import { RUN_TYPES, RUN_TYPE_LABELS, type PlannedRun, type PlannedRunInput } from '../../api/types'

const optionalClock = (label: string) =>
  optionalText.refine((v) => v === undefined || (parseClock(v) ?? 0) > 0, `${label}: usa mm:ss o h:mm:ss`)

function buildSchema(minDate: string, maxDate: string) {
  return z.object({
    scheduled_date: isoDate.refine((d) => d >= minDate && d <= maxDate, `Elige una fecha entre ${minDate} y ${maxDate}`),
    run_type: z.enum(['easy', 'tempo', 'interval', 'long', 'recovery', 'race']),
    distance_km: optionalNumber(z.number().positive('Debe ser positivo')),
    duration: optionalClock('Duración'),
    pace: optionalClock('Ritmo'),
    description: optionalText,
  })
}

const RUN_TYPE_OPTIONS = RUN_TYPES.map((value) => ({ value, label: RUN_TYPE_LABELS[value] }))

interface PlannedRunFormProps {
  planStart: string
  planEnd: string
  initial?: PlannedRun
  pending: boolean
  error: unknown
  onSubmit: (body: PlannedRunInput) => void
  onCancel: () => void
}

/** Presentational planned-run editor; distance in km, duration/pace as clock strings. */
export function PlannedRunForm({ planStart, planEnd, initial, pending, error, onSubmit, onCancel }: PlannedRunFormProps) {
  const schema = useMemo(() => buildSchema(planStart, planEnd), [planStart, planEnd])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      scheduled_date: initial?.scheduled_date ?? planStart,
      run_type: initial?.run_type ?? 'easy',
      distance_km: initial?.target_distance_m != null ? String(initial.target_distance_m / 1000) : '',
      duration: toClock(initial?.target_duration_s),
      pace: toClock(initial?.target_pace_s_per_km),
      description: initial?.description ?? '',
    },
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={handleSubmit((v) =>
        onSubmit({
          scheduled_date: v.scheduled_date,
          run_type: v.run_type,
          target_distance_m: v.distance_km !== undefined ? Math.round(v.distance_km * 1000) : null,
          target_duration_s: v.duration ? parseClock(v.duration) : null,
          target_pace_s_per_km: v.pace ? parseClock(v.pace) : null,
          description: v.description ?? null,
        }),
      )}
    >
      <div className="grid grid-cols-2 gap-2">
        <Input label="Fecha" type="date" min={planStart} max={planEnd} error={errors.scheduled_date?.message} {...register('scheduled_date')} />
        <Select label="Tipo" options={RUN_TYPE_OPTIONS} {...register('run_type')} />
        <Input label="Distancia (km)" inputMode="decimal" error={errors.distance_km?.message} {...register('distance_km')} />
        <Input label="Duración (h:mm:ss)" placeholder="45:00" error={errors.duration?.message} {...register('duration')} />
        <Input label="Ritmo (min/km)" placeholder="5:30" error={errors.pace?.message} {...register('pace')} />
      </div>
      <Textarea label="Descripción" {...register('description')} />
      <ErrorMessage error={error} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {initial ? 'Guardar carrera' : 'Añadir carrera'}
        </Button>
      </div>
    </form>
  )
}
