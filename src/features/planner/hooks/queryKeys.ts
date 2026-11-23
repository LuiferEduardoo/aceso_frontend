import type { DateRange } from '@/shared/lib/dates'

export const plannerKeys = {
  all: ['planner'] as const,
  habits: () => [...plannerKeys.all, 'habits'] as const,
  habitList: (includeArchived: boolean) => [...plannerKeys.habits(), 'list', includeArchived] as const,
  habit: (id: number) => [...plannerKeys.habits(), 'detail', id] as const,
  habitStats: (id: number, range: DateRange) => [...plannerKeys.habit(id), 'stats', range.from, range.to] as const,
  agenda: () => [...plannerKeys.all, 'agenda'] as const,
  agendaRange: (range: DateRange) => [...plannerKeys.agenda(), range.from, range.to] as const,
}
