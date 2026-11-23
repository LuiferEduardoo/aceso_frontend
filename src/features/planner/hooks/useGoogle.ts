import { useMutation, useQuery } from '@tanstack/react-query'
import { browser } from '@/shared/lib/browser'
import { googleApi } from '../api/googleApi'
import { plannerKeys } from './queryKeys'
import { useInvalidate } from './useInvalidate'

/** Also the only connection signal: the backend answers 404 when no account is linked. */
export function useGoogleCalendars() {
  return useQuery({ queryKey: plannerKeys.googleCalendars(), queryFn: googleApi.calendars })
}

export function useGoogleConnect() {
  return useMutation({
    mutationFn: googleApi.authorizationUrl,
    // Consent happens on accounts.google.com; the backend callback finishes the link.
    onSuccess: (url) => browser.assign(url),
  })
}

export function useSelectGoogleCalendar() {
  const invalidate = useInvalidate(plannerKeys.events(), plannerKeys.agenda())
  return useMutation({ mutationFn: (calendarId: string) => googleApi.selectCalendar(calendarId), onSuccess: invalidate })
}

/** Sync pulls remote events and pushes local events, tasks and habits. */
export function useGoogleSync() {
  const invalidate = useInvalidate(plannerKeys.all)
  return useMutation({ mutationFn: googleApi.sync, onSuccess: invalidate })
}

export function useGoogleDisconnect() {
  const invalidate = useInvalidate(plannerKeys.google())
  return useMutation({ mutationFn: googleApi.disconnect, onSuccess: invalidate })
}
