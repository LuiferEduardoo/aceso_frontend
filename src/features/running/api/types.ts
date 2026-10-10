import type { Schemas } from '@/shared/api/client'

export type TrainingPlan = Schemas['TrainingPlanRead']
export type TrainingPlanCreate = Schemas['TrainingPlanCreate']
export type TrainingPlanUpdate = Schemas['TrainingPlanUpdate']
export type PlannedRun = Schemas['PlannedRunRead']
export type PlannedRunInput = Schemas['PlannedRunIn']
export type PlannedRunUpdate = Schemas['PlannedRunUpdate']
export type RunType = Schemas['RunType']
export type Activity = Schemas['ActivityRead']

export const RUN_TYPES: readonly RunType[] = ['easy', 'tempo', 'interval', 'long', 'recovery', 'race']

export const RUN_TYPE_LABELS: Record<RunType, string> = {
  easy: 'Suave',
  tempo: 'Tempo',
  interval: 'Intervalos',
  long: 'Larga',
  recovery: 'Recuperación',
  race: 'Carrera',
}

/** Backend limit for any date-range query in the running module. */
export const MAX_RANGE_DAYS = 366
