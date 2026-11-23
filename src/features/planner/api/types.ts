import type { Schemas } from '@/shared/api/client'

/** The backend groups planner calendar days in this zone. */
export const PLANNER_TIMEZONE = 'America/Bogota'

/** Backend limit for any date-range query in the planner module. */
export const MAX_RANGE_DAYS = 366

export type Habit = Schemas['HabitRead']
export type HabitCreate = Schemas['HabitCreate']
export type HabitUpdate = Schemas['HabitUpdate']
export type HabitFrequency = Schemas['HabitFrequency']
export type HabitLog = Schemas['HabitLogRead']
export type HabitLogInput = Schemas['HabitLogIn']
export type HabitStats = Schemas['HabitStatsRead']
export type StreakUnit = Schemas['StreakUnit']

export type AgendaDay = Schemas['AgendaDayRead']
export type AgendaHabit = Schemas['AgendaHabitRead']

export const HABIT_FREQUENCIES: readonly HabitFrequency[] = ['daily', 'weekdays', 'times_per_week']

export const HABIT_FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: 'Diario',
  weekdays: 'Días de la semana',
  times_per_week: 'Veces por semana',
}

/** Index = backend weekday (0 = Monday .. 6 = Sunday). */
export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const

export const STREAK_UNIT_LABELS: Record<StreakUnit, string> = {
  day: 'días',
  week: 'semanas',
}

/** Human summary of a habit's frequency, e.g. "Lun, Mié, Vie" or "3 veces por semana". */
export function describeFrequency(habit: Pick<Habit, 'frequency' | 'weekdays' | 'times_per_week'>): string {
  if (habit.frequency === 'weekdays') return habit.weekdays.map((day) => WEEKDAY_LABELS[day]).join(', ')
  if (habit.frequency === 'times_per_week') return `${habit.times_per_week ?? 0} veces por semana`
  return HABIT_FREQUENCY_LABELS.daily
}

export type Task = Schemas['TaskRead']
export type TaskCreate = Schemas['TaskCreate']
export type TaskUpdate = Schemas['TaskUpdate']
export type TaskStatus = Schemas['TaskStatus']
export type TaskPriority = Schemas['TaskPriority']

export interface TaskFilters {
  status?: TaskStatus
  due_from?: string
  due_to?: string
}

export const TASK_STATUSES: readonly TaskStatus[] = ['todo', 'in_progress', 'done', 'cancelled']

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Pendiente',
  in_progress: 'En curso',
  done: 'Hecha',
  cancelled: 'Cancelada',
}

export const TASK_PRIORITIES: readonly TaskPriority[] = ['low', 'medium', 'high']

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}

export type CalendarEvent = Schemas['CalendarEventRead']
export type CalendarEventCreate = Schemas['CalendarEventCreate']
export type CalendarEventUpdate = Schemas['CalendarEventUpdate']

/** Events owned by a task or habit are read-only: edit their owner instead. */
export function isLinkedEvent(event: Pick<CalendarEvent, 'task_id' | 'habit_id'>): boolean {
  return event.task_id !== null || event.habit_id !== null
}

export type GoogleCalendar = Schemas['GoogleCalendarRead']
export type GoogleCalendarLink = Schemas['GoogleCalendarLinkRead']
export type GoogleSyncResult = Schemas['GoogleSyncResultRead']
