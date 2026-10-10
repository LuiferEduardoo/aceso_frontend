import type { Schemas } from '@/shared/api/client'

export type Exercise = Schemas['ExerciseRead']
export type ExerciseCreate = Schemas['ExerciseCreate']
export type ExerciseUpdate = Schemas['ExerciseUpdate']
export type MuscleGroup = Schemas['MuscleGroup']
export type Equipment = Schemas['Equipment']
export type ExerciseType = Schemas['ExerciseType']

export type Routine = Schemas['RoutineRead']
export type RoutineCreate = Schemas['RoutineCreate']
export type RoutineUpdate = Schemas['RoutineUpdate']
export type RoutineExerciseInput = Schemas['RoutineExerciseIn']

export type WorkoutSession = Schemas['WorkoutSessionRead']
export type WorkoutSessionCreate = Schemas['WorkoutSessionCreate']
export type WorkoutSessionUpdate = Schemas['WorkoutSessionUpdate']
export type SessionStatus = Schemas['SessionStatus']
export type SessionExercise = Schemas['SessionExerciseRead']
export type ExerciseSet = Schemas['ExerciseSetRead']
export type ExerciseSetInput = Schemas['ExerciseSetIn']
export type ExerciseSetUpdate = Schemas['ExerciseSetUpdate']
export type SetIntervalInput = Schemas['SetIntervalIn']

export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'full_body',
  'cardio',
] as const satisfies readonly MuscleGroup[]
export const EQUIPMENT = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'kettlebell',
  'bodyweight',
  'band',
  'cardio_machine',
  'other',
] as const satisfies readonly Equipment[]
export const EXERCISE_TYPES = ['compound', 'isolation', 'cardio'] as const satisfies readonly ExerciseType[]
export const SESSION_STATUSES: readonly SessionStatus[] = ['planned', 'completed', 'skipped']

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebrazos',
  abs: 'Abdomen',
  quadriceps: 'Cuádriceps',
  hamstrings: 'Isquiotibiales',
  glutes: 'Glúteos',
  calves: 'Pantorrillas',
  full_body: 'Cuerpo completo',
  cardio: 'Cardio',
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  machine: 'Máquina',
  cable: 'Polea',
  kettlebell: 'Kettlebell',
  bodyweight: 'Peso corporal',
  band: 'Banda elástica',
  cardio_machine: 'Máquina de cardio',
  other: 'Otro',
}

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  compound: 'Compuesto',
  isolation: 'Aislamiento',
  cardio: 'Cardio',
}

/** Picker label that disambiguates exercises by their primary muscle group. */
export function exerciseOptionLabel(exercise: Pick<Exercise, 'name' | 'muscle_group'>): string {
  return `${exercise.name} · ${MUSCLE_GROUP_LABELS[exercise.muscle_group]}`
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  planned: 'Planificada',
  completed: 'Completada',
  skipped: 'Omitida',
}

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
