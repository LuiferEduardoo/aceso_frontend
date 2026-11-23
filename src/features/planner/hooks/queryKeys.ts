import type { DateRange } from '@/shared/lib/dates'
import type { TaskFilters } from '../api/types'

export const plannerKeys = {
  all: ['planner'] as const,
  habits: () => [...plannerKeys.all, 'habits'] as const,
  habitList: (includeArchived: boolean) => [...plannerKeys.habits(), 'list', includeArchived] as const,
  habit: (id: number) => [...plannerKeys.habits(), 'detail', id] as const,
  habitStats: (id: number, range: DateRange) => [...plannerKeys.habit(id), 'stats', range.from, range.to] as const,
  tasks: () => [...plannerKeys.all, 'tasks'] as const,
  taskList: (filters: TaskFilters) =>
    [...plannerKeys.tasks(), 'list', filters.status ?? null, filters.due_from ?? null, filters.due_to ?? null] as const,
  events: () => [...plannerKeys.all, 'events'] as const,
  eventRange: (range: DateRange) => [...plannerKeys.events(), range.from, range.to] as const,
  agenda: () => [...plannerKeys.all, 'agenda'] as const,
  agendaRange: (range: DateRange) => [...plannerKeys.agenda(), range.from, range.to] as const,
}
