import { useMutation, useQuery } from '@tanstack/react-query'
import { browser } from '@/shared/lib/browser'
import { googleApi } from '../api/googleApi'
import { plannerKeys } from './queryKeys'
import { useInvalidate } from './useInvalidate'

/** Whether an account is linked, plus the synced calendar and last sync time. */
export function useGoogleStatus() {
  return useQuery({ queryKey: plannerKeys.googleStatus(), queryFn: googleApi.status })
}

/** Calls Google, so only fetch it once the account is connected. */
export function useGoogleCalendars(enabled: boolean) {
  return useQuery({ queryKey: plannerKeys.googleCalendars(), queryFn: googleApi.calendars, enabled })
}

export function useGoogleConnect() {
  return useMutation({
    mutationFn: googleApi.authorizationUrl,
    // Consent happens on accounts.google.com; the backend callback finishes the link.
    onSuccess: (url) => browser.assign(url),
  })
}

export function useSelectGoogleCalendar() {
  const invalidate = useInvalidate(plannerKeys.events(), plannerKeys.agenda(), plannerKeys.googleStatus())
  return useMutation({ mutationFn: (calendarId: string) => googleApi.selectCalendar(calendarId), onSuccess: invalidate })
}

/** Sync pulls remote events and pushes local events, tasks and habits (and refreshes the status). */
export function useGoogleSync() {
  const invalidate = useInvalidate(plannerKeys.all)
  return useMutation({ mutationFn: googleApi.sync, onSuccess: invalidate })
}

export function useGoogleDisconnect() {
  const invalidate = useInvalidate(plannerKeys.google())
  return useMutation({ mutationFn: googleApi.disconnect, onSuccess: invalidate })
}
