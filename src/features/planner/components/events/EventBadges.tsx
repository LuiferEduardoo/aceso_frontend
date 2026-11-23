import { Badge } from '@/shared/ui'
import type { CalendarEvent } from '../../api/types'

export function EventBadges({ event }: { event: CalendarEvent }) {
  return (
    <>
      {event.source === 'google' && <Badge tone="info">Google</Badge>}
      {event.task_id !== null && <Badge>Tarea</Badge>}
      {event.habit_id !== null && <Badge>Hábito</Badge>}
      {event.sync_pending && <Badge tone="warning">Pendiente de sincronizar</Badge>}
    </>
  )
}
