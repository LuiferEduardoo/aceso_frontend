import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'
import type { CalendarEvent } from '../../api/types'

/** "Todo el día" or "09:00–10:30" in the browser's local time. */
export function eventTimeLabel(event: Pick<CalendarEvent, 'all_day' | 'start_at' | 'end_at'>): string {
  if (event.all_day) return 'Todo el día'
  return `${format(parseISO(event.start_at), 'HH:mm')}–${format(parseISO(event.end_at), 'HH:mm')}`
}

export function eventDateLabel(event: Pick<CalendarEvent, 'start_at'>): string {
  return format(parseISO(event.start_at), "EEE d 'de' MMM", { locale: es })
}
