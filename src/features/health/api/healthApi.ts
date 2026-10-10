import { api, unwrap } from '@/shared/api/client'
import type { DateRange } from '@/shared/lib/dates'
import type {
  DailySummary,
  DateTimeRange,
  HealthSample,
  HealthSource,
  IngestRequest,
  IngestResult,
  SampleMetric,
  SleepSession,
} from './types'

const rangeQuery = ({ from, to }: DateRange, source?: HealthSource) => ({
  params: { query: { from, to, ...(source ? { source } : {}) } },
})

export const healthApi = {
  summaries: (range: DateRange, source?: HealthSource): Promise<DailySummary[]> =>
    unwrap(api.GET('/health/summaries', rangeQuery(range, source))),
  sleep: (range: DateRange, source?: HealthSource): Promise<SleepSession[]> =>
    unwrap(api.GET('/health/sleep', rangeQuery(range, source))),
  samples: (metric: SampleMetric, { from, to }: DateTimeRange, source?: HealthSource): Promise<HealthSample[]> =>
    unwrap(api.GET('/health/samples', { params: { query: { metric, from, to, ...(source ? { source } : {}) } } })),
  ingest: (body: IngestRequest): Promise<IngestResult> => unwrap(api.POST('/health/ingest', { body })),
}

export const garminApi = {
  connect: async (body: { email: string; password: string }): Promise<void> => {
    await unwrap(api.POST('/health/garmin/connect', { body }))
  },
  disconnect: async (): Promise<void> => {
    await unwrap(api.DELETE('/health/garmin/connect'))
  },
  sync: ({ from, to }: DateRange): Promise<IngestResult> =>
    unwrap(api.POST('/health/garmin/sync', { params: { query: { from, to } } })),
}
