import type { DateRange } from '@/shared/lib/dates'

export const runningKeys = {
  all: ['running'] as const,
  plans: () => [...runningKeys.all, 'plans'] as const,
  plan: (id: number) => [...runningKeys.plans(), id] as const,
  plannedRuns: () => [...runningKeys.all, 'planned-runs'] as const,
  plannedRunRange: (range: DateRange) => [...runningKeys.plannedRuns(), range.from, range.to] as const,
  activities: () => [...runningKeys.all, 'activities'] as const,
  activityRange: (range: DateRange) => [...runningKeys.activities(), 'range', range.from, range.to] as const,
  activity: (id: number) => [...runningKeys.activities(), 'detail', id] as const,
}
