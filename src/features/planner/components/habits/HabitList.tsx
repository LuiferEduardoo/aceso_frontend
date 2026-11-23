import { Link } from 'react-router'
import { Badge, Button, Checkbox, ConfirmButton } from '@/shared/ui'
import { describeFrequency, type AgendaHabit, type Habit } from '../../api/types'

interface HabitListProps {
  habits: Habit[]
  /** Today's occurrence per habit id; habits not expected today are missing. */
  today: ReadonlyMap<number, AgendaHabit>
  togglingId: number | null
  onToggleToday: (habit: Habit, done: boolean) => void
  onEdit: (habit: Habit) => void
  onArchive: (habit: Habit, archived: boolean) => void
  onDelete: (habit: Habit) => void
}

export function HabitList({ habits, today, togglingId, onToggleToday, onEdit, onArchive, onDelete }: HabitListProps) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {habits.map((habit) => {
        const archived = habit.archived_at !== null
        const occurrence = today.get(habit.id)
        return (
          <li key={habit.id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/planner/habits/${habit.id}`} className="font-medium text-emerald-700 hover:underline">
                {habit.name}
              </Link>
              {archived && <Badge>Archivado</Badge>}
              {habit.sync_to_calendar && <Badge tone="info">Google</Badge>}
            </div>
            <p className="text-sm text-slate-500">
              {describeFrequency(habit)} · meta {habit.target_count}
              {habit.unit ? ` ${habit.unit}` : ''}
              {habit.time_of_day ? ` · ${habit.time_of_day.slice(0, 5)}` : ''}
            </p>
            {!archived &&
              (occurrence ? (
                <Checkbox
                  label={occurrence.target_count > 1 ? `Hecho hoy (${occurrence.count}/${occurrence.target_count})` : 'Hecho hoy'}
                  checked={occurrence.completed}
                  disabled={togglingId === habit.id}
                  onChange={(e) => onToggleToday(habit, e.target.checked)}
                />
              ) : (
                <p className="text-sm text-slate-500">No toca hoy</p>
              ))}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => onEdit(habit)}>
                Editar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onArchive(habit, !archived)}>
                {archived ? 'Desarchivar' : 'Archivar'}
              </Button>
              <ConfirmButton onConfirm={() => onDelete(habit)}>Eliminar</ConfirmButton>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
