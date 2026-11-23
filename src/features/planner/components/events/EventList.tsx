import { Button, ConfirmButton } from '@/shared/ui'
import { isLinkedEvent, type CalendarEvent } from '../../api/types'
import { EventBadges } from './EventBadges'
import { eventDateLabel, eventTimeLabel } from './eventTime'

interface EventListProps {
  events: CalendarEvent[]
  onEdit: (event: CalendarEvent) => void
  onDelete: (event: CalendarEvent) => void
}

export function EventList({ events, onEdit, onDelete }: EventListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {events.map((event) => {
        const linked = isLinkedEvent(event)
        return (
          <li
            key={event.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700"
          >
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{event.title}</span>
                <EventBadges event={event} />
              </div>
              <p className="text-sm text-slate-500">
                {eventDateLabel(event)} · {eventTimeLabel(event)}
                {event.location ? ` · ${event.location}` : ''}
              </p>
              {linked && <p className="text-xs text-slate-500">Edita la tarea o el hábito al que pertenece.</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" disabled={linked} onClick={() => onEdit(event)}>
                Editar
              </Button>
              <ConfirmButton disabled={linked} onConfirm={() => onDelete(event)}>
                Eliminar
              </ConfirmButton>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
