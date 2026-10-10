import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { DateRange } from '@/shared/lib/dates'
import { garminApi, healthApi } from '../api/healthApi'
import type { DateTimeRange, HealthSource, IngestRequest, SampleMetric } from '../api/types'

export const healthKeys = {
  all: ['health'] as const,
  summaries: (range: DateRange, source?: HealthSource) =>
    [...healthKeys.all, 'summaries', range.from, range.to, source ?? 'all'] as const,
  sleep: (range: DateRange, source?: HealthSource) =>
    [...healthKeys.all, 'sleep', range.from, range.to, source ?? 'all'] as const,
  samples: (metric: SampleMetric, range: DateTimeRange, source?: HealthSource) =>
    [...healthKeys.all, 'samples', metric, range.from, range.to, source ?? 'all'] as const,
}

export function useDailySummaries(range: DateRange, source?: HealthSource) {
  return useQuery({ queryKey: healthKeys.summaries(range, source), queryFn: () => healthApi.summaries(range, source) })
}

export function useSleepSessions(range: DateRange, source?: HealthSource) {
  return useQuery({ queryKey: healthKeys.sleep(range, source), queryFn: () => healthApi.sleep(range, source) })
}

export function useSamples(metric: SampleMetric, range: DateTimeRange, source?: HealthSource) {
  return useQuery({
    queryKey: healthKeys.samples(metric, range, source),
    queryFn: () => healthApi.samples(metric, range, source),
  })
}

/** New data from ingest or sync can touch every health query. */
function useInvalidateHealth() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: healthKeys.all })
}

export function useIngest() {
  const invalidate = useInvalidateHealth()
  return useMutation({ mutationFn: (body: IngestRequest) => healthApi.ingest(body), onSuccess: invalidate })
}

export function useGarminConnect() {
  return useMutation({ mutationFn: garminApi.connect })
}

export function useGarminDisconnect() {
  return useMutation({ mutationFn: garminApi.disconnect })
}

export function useGarminSync() {
  const invalidate = useInvalidateHealth()
  return useMutation({ mutationFn: (range: DateRange) => garminApi.sync(range), onSuccess: invalidate })
}
