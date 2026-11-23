import type { ReactNode } from 'react'
import { formatDateTime } from '@/shared/lib/format'
import { Badge, Button } from '@/shared/ui'
import { isLinkedEvent, TASK_STATUS_LABELS, type AgendaDay, type CalendarEvent } from '../../api/types'
import { EventBadges } from '../events/EventBadges'
import { eventTimeLabel } from '../events/eventTime'

function Section({ title, empty, children }: { title: string; empty: boolean; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      {empty ? <p className="text-sm text-slate-500">Nada para este día.</p> : <ul className="flex flex-col gap-1">{children}</ul>}
    </section>
  )
}

interface AgendaDayDetailProps {
  day: AgendaDay
  onNewEvent: () => void
  onEditEvent: (event: CalendarEvent) => void
}

/** Everything planned for one day; local events can be edited from here. */
export function AgendaDayDetail({ day, onNewEvent, onEditEvent }: AgendaDayDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Eventos" empty={day.events.length === 0}>
        {day.events.map((event) => (
          <li key={event.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500">{eventTimeLabel(event)}</span>
              <span className="font-medium">{event.title}</span>
              <EventBadges event={event} />
            </span>
            {!isLinkedEvent(event) && (
              <Button size="sm" variant="ghost" onClick={() => onEditEvent(event)} aria-label={`Editar ${event.title}`}>
                Editar
              </Button>
            )}
          </li>
        ))}
      </Section>
      <Section title="Tareas" empty={day.tasks.length === 0}>
        {day.tasks.map((task) => (
          <li key={task.id} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">{task.title}</span>
            <Badge tone={task.status === 'done' ? 'success' : 'neutral'}>{TASK_STATUS_LABELS[task.status]}</Badge>
            {task.scheduled_start && <span className="text-slate-500">{formatDateTime(task.scheduled_start)}</span>}
          </li>
        ))}
      </Section>
      <Section title="Hábitos" empty={day.habits.length === 0}>
        {day.habits.map((habit) => (
          <li key={habit.habit_id} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">{habit.name}</span>
            <Badge tone={habit.completed ? 'success' : 'neutral'}>
              {habit.completed ? 'Cumplido' : `${habit.count}/${habit.target_count}`}
            </Badge>
            {habit.time_of_day && <span className="text-slate-500">{habit.time_of_day.slice(0, 5)}</span>}
          </li>
        ))}
      </Section>
      <div className="flex justify-end">
        <Button onClick={onNewEvent}>Nuevo evento</Button>
      </div>
    </div>
  )
}
