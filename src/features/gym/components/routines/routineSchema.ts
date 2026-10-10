import { z } from 'zod'
import { numberToInput, optionalNumber, optionalText, requiredNumber } from '@/shared/lib/forms'
import type { Routine, RoutineCreate } from '../../api/types'

const routineExerciseSchema = z.object({
  exercise_id: requiredNumber(z.number({ error: 'Elige un ejercicio' }).int().min(1, 'Elige un ejercicio')),
  target_sets: optionalNumber(z.number().int('Número entero').min(1, 'Mínimo 1').max(100, 'Máximo 100')),
  target_reps: optionalNumber(z.number().int('Número entero').min(1, 'Mínimo 1').max(1000, 'Máximo 1000')),
  target_weight_kg: optionalNumber(z.number().min(0, 'No puede ser negativo')),
  target_duration_s: optionalNumber(z.number().int('Segundos enteros').positive('Debe ser positivo')),
  notes: optionalText,
})

export const routineSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(100, 'Usa como máximo 100 caracteres'),
  description: optionalText,
  exercises: z.array(routineExerciseSchema),
})

export type RoutineFormInput = z.input<typeof routineSchema>
export type RoutineFormOutput = z.output<typeof routineSchema>

export const emptyRoutineExercise = {
  exercise_id: '',
  target_sets: '',
  target_reps: '',
  target_weight_kg: '',
  target_duration_s: '',
  notes: '',
}

export function routineToForm(routine?: Routine): RoutineFormInput {
  return {
    name: routine?.name ?? '',
    description: routine?.description ?? '',
    exercises: [...(routine?.exercises ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        exercise_id: String(item.exercise_id),
        target_sets: numberToInput(item.target_sets),
        target_reps: numberToInput(item.target_reps),
        target_weight_kg: numberToInput(item.target_weight_kg),
        target_duration_s: numberToInput(item.target_duration_s),
        notes: item.notes ?? '',
      })),
  }
}

/** Builds the payload; nulls clear optional values on update. */
export function formToRoutine(values: RoutineFormOutput): RoutineCreate {
  return {
    name: values.name,
    description: values.description ?? null,
    exercises: values.exercises.map((item) => ({
      exercise_id: item.exercise_id,
      target_sets: item.target_sets ?? null,
      target_reps: item.target_reps ?? null,
      target_weight_kg: item.target_weight_kg ?? null,
      target_duration_s: item.target_duration_s ?? null,
      notes: item.notes ?? null,
    })),
  }
}
