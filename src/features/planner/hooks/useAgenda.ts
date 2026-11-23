import { useQuery } from '@tanstack/react-query'
import type { DateRange } from '@/shared/lib/dates'
import { agendaApi } from '../api/agendaApi'
import { plannerKeys } from './queryKeys'

export function useAgenda(range: DateRange) {
  return useQuery({ queryKey: plannerKeys.agendaRange(range), queryFn: () => agendaApi.between(range) })
}
