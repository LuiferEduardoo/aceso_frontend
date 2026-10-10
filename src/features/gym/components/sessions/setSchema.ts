import { z } from 'zod'
import { numberToInput, optionalNumber, optionalText, orNull } from '@/shared/lib/forms'
import type { ExerciseSet, ExerciseSetInput } from '../../api/types'

const intervalSchema = z
  .object({
    duration_s: optionalNumber(z.number().int('Segundos enteros').positive('Debe ser positivo')),
    distance_m: optionalNumber(z.number().positive('Debe ser positivo')),
    speed: optionalNumber(z.number().min(0, 'No puede ser negativo')),
    incline_pct: optionalNumber(z.number().min(-100, 'Mínimo -100').max(100, 'Máximo 100')),
    level: optionalNumber(z.number().int('Número entero').min(0, 'No puede ser negativo')),
  })
  .refine((i) => i.duration_s !== undefined || i.distance_m !== undefined, {
    message: 'Indica la duración o la distancia',
    path: ['duration_s'],
  })

export const setSchema = z
  .object({
    reps: optionalNumber(z.number().int('Número entero').min(0, 'No puede ser negativo')),
    weight_kg: optionalNumber(z.number().min(0, 'No puede ser negativo')),
    added_weight_kg: optionalNumber(z.number().min(0, 'No puede ser negativo')),
    duration_s: optionalNumber(z.number().int('Segundos enteros').positive('Debe ser positivo')),
    distance_m: optionalNumber(z.number().min(0, 'No puede ser negativo')),
    rpe: optionalNumber(z.number().min(1, 'El RPE va de 1 a 10').max(10, 'El RPE va de 1 a 10')),
    completed: z.boolean(),
    notes: optionalText,
    intervals: z.array(intervalSchema),
  })
  .refine(
    (s) =>
      [s.reps, s.weight_kg, s.added_weight_kg, s.duration_s, s.distance_m].some((v) => v !== undefined) ||
      s.intervals.length > 0,
    { message: 'Introduce al menos una métrica (repeticiones, peso, duración o distancia) o un intervalo', path: ['reps'] },
  )

export type SetFormInput = z.input<typeof setSchema>
export type SetFormOutput = z.output<typeof setSchema>

export const emptyInterval = { duration_s: '', distance_m: '', speed: '', incline_pct: '', level: '' }

export function setToForm(set?: ExerciseSet): SetFormInput {
  return {
    reps: numberToInput(set?.reps),
    weight_kg: numberToInput(set?.weight_kg),
    added_weight_kg: numberToInput(set?.added_weight_kg),
    duration_s: numberToInput(set?.duration_s),
    distance_m: numberToInput(set?.distance_m),
    rpe: numberToInput(set?.rpe),
    completed: set?.completed ?? false,
    notes: set?.notes ?? '',
    intervals: (set?.intervals ?? []).map((i) => ({
      duration_s: numberToInput(i.duration_s),
      distance_m: numberToInput(i.distance_m),
      speed: numberToInput(i.speed),
      incline_pct: numberToInput(i.incline_pct),
      level: numberToInput(i.level),
    })),
  }
}

/** Full payload with explicit nulls, valid for both create and PATCH (intervals are replaced). */
export function formToSet(values: SetFormOutput): ExerciseSetInput {
  const n = orNull
  return {
    reps: n(values.reps),
    weight_kg: n(values.weight_kg),
    added_weight_kg: n(values.added_weight_kg),
    duration_s: n(values.duration_s),
    distance_m: n(values.distance_m),
    rpe: n(values.rpe),
    completed: values.completed,
    notes: n(values.notes),
    intervals: values.intervals.map((i) => ({
      duration_s: n(i.duration_s),
      distance_m: n(i.distance_m),
      speed: n(i.speed),
      incline_pct: n(i.incline_pct),
      level: n(i.level),
    })),
  }
}
