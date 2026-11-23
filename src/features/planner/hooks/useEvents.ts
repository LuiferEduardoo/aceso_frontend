import { useMutation, useQuery } from '@tanstack/react-query'
import type { DateRange } from '@/shared/lib/dates'
import { eventsApi } from '../api/eventsApi'
import type { CalendarEventCreate, CalendarEventUpdate } from '../api/types'
import { plannerKeys } from './queryKeys'
import { useInvalidate } from './useInvalidate'

export function useEvents(range: DateRange) {
  return useQuery({ queryKey: plannerKeys.eventRange(range), queryFn: () => eventsApi.list(range) })
}

function useInvalidateEvents() {
  return useInvalidate(plannerKeys.events(), plannerKeys.agenda())
}

export function useCreateEvent() {
  const invalidate = useInvalidateEvents()
  return useMutation({ mutationFn: (body: CalendarEventCreate) => eventsApi.create(body), onSuccess: invalidate })
}

export function useUpdateEvent() {
  const invalidate = useInvalidateEvents()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CalendarEventUpdate }) => eventsApi.update(id, body),
    onSuccess: invalidate,
  })
}

export function useDeleteEvent() {
  const invalidate = useInvalidateEvents()
  return useMutation({ mutationFn: (id: number) => eventsApi.remove(id), onSuccess: invalidate })
}
