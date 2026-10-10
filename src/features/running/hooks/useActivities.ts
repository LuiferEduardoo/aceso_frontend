import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { DateRange } from '@/shared/lib/dates'
import { activitiesApi, stravaApi } from '../api/activitiesApi'
import { runningKeys } from './queryKeys'

export function useActivities(range: DateRange, enabled = true) {
  return useQuery({
    queryKey: runningKeys.activityRange(range),
    queryFn: () => activitiesApi.list(range),
    enabled,
  })
}

export function useActivity(id: number) {
  return useQuery({ queryKey: runningKeys.activity(id), queryFn: () => activitiesApi.get(id) })
}

export function useStravaConnect() {
  return useMutation({
    mutationFn: stravaApi.authorizationUrl,
    // Strava consent happens on strava.com; the backend callback finishes the link.
    onSuccess: (url) => window.location.assign(url),
  })
}

export function useStravaSync() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (after?: string) => stravaApi.sync(after),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: runningKeys.activities() }),
  })
}

export function useStravaDisconnect() {
  return useMutation({ mutationFn: stravaApi.disconnect })
}
