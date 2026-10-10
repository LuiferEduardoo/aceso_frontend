import type { DateRange } from '@/shared/lib/dates'

export const gymKeys = {
  all: ['gym'] as const,
  exercises: () => [...gymKeys.all, 'exercises'] as const,
  exercisePhoto: (id: number, version: string | null) => [...gymKeys.exercises(), id, 'photo', version] as const,
  routines: () => [...gymKeys.all, 'routines'] as const,
  routine: (id: number) => [...gymKeys.routines(), id] as const,
  sessions: () => [...gymKeys.all, 'sessions'] as const,
  sessionRange: (range: DateRange) => [...gymKeys.sessions(), 'range', range.from, range.to] as const,
  session: (id: number) => [...gymKeys.sessions(), 'detail', id] as const,
}
