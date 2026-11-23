import type { AgendaDay } from '../../api/types'
import { eventTimeLabel } from '../events/eventTime'

export type AgendaItemKind = 'event' | 'task' | 'habit'

export interface AgendaItem {
  key: string
  kind: AgendaItemKind
  label: string
  done: boolean
}

/** Flattens a day into calendar chips: events first, then tasks, then habits. */
export function agendaItems(day: AgendaDay): AgendaItem[] {
  return [
    ...day.events.map((event) => ({
      key: `event-${event.id}`,
      kind: 'event' as const,
      label: event.all_day ? event.title : `${eventTimeLabel(event).slice(0, 5)} ${event.title}`,
      done: false,
    })),
    ...day.tasks.map((task) => ({ key: `task-${task.id}`, kind: 'task' as const, label: task.title, done: task.status === 'done' })),
    ...day.habits.map((habit) => ({
      key: `habit-${habit.habit_id}`,
      kind: 'habit' as const,
      label: habit.name,
      done: habit.completed,
    })),
  ]
}
