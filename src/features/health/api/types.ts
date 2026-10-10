import type { Schemas } from '@/shared/api/client'

export type DailySummary = Schemas['DailySummaryRead']
export type HealthSample = Schemas['HealthSampleRead']
export type SleepSession = Schemas['SleepSessionRead']
export type HealthSource = Schemas['HealthSource']
export type SampleMetric = Schemas['SampleMetric']
export type IngestRequest = Schemas['HealthIngestRequest']
export type IngestResult = Schemas['IngestResultRead']

export const HEALTH_SOURCES: readonly HealthSource[] = ['garmin', 'mi_fitness', 'health_connect', 'manual']
export const SAMPLE_METRICS: readonly SampleMetric[] = ['heart_rate', 'stress', 'spo2', 'respiration', 'body_battery']

export const HEALTH_SOURCE_LABELS: Record<HealthSource, string> = {
  garmin: 'Garmin',
  mi_fitness: 'Mi Fitness',
  health_connect: 'Health Connect',
  manual: 'Manual',
}

export const SAMPLE_METRIC_LABELS: Record<SampleMetric, string> = {
  heart_rate: 'Frecuencia cardiaca',
  stress: 'Estrés',
  spo2: 'SpO2',
  respiration: 'Respiración',
  body_battery: 'Body Battery',
}

/** Backend limits. */
export const MAX_DAILY_RANGE_DAYS = 366
export const MAX_SAMPLE_RANGE_DAYS = 31
export const MAX_GARMIN_SYNC_DAYS = 31

export interface DateTimeRange {
  /** Aware ISO datetimes. */
  from: string
  to: string
}
