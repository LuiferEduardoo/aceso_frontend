import { addMonths, startOfMonth } from 'date-fns'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { monthGrid, today } from '@/shared/lib/dates'
import { cn } from '@/shared/lib/cn'
import { Button, Card, ErrorMessage, Modal, Spinner } from '@/shared/ui'
import type { WorkoutSession } from '../../api/types'
import { useCreateSession, useSessionsInRange } from '../../hooks/useSessions'
import { MonthCalendar } from './MonthCalendar'
import { MonthNavigator } from './MonthNavigator'
import { NewSessionForm } from './NewSessionForm'

const STATUS_STYLES: Record<WorkoutSession['status'], string> = {
  planned: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  skipped: 'bg-amber-100 text-amber-800 line-through dark:bg-amber-900 dark:text-amber-100',
}

export function SessionsCalendarContainer() {
  const navigate = useNavigate()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const grid = useMemo(() => monthGrid(month), [month])
  const sessions = useSessionsInRange(grid.range)
  const create = useCreateSession()
  const [newDate, setNewDate] = useState<string | null>(null)

  const byDay = useMemo(() => {
    const map = new Map<string, WorkoutSession[]>()
    for (const session of sessions.data ?? []) {
      map.set(session.scheduled_date, [...(map.get(session.scheduled_date) ?? []), session])
    }
    return map
  }, [sessions.data])

  const closeNew = () => {
    setNewDate(null)
    create.reset()
  }

  return (
    <Card
      title="Sesiones"
      actions={
        <>
          <MonthNavigator
            month={month}
            onPrevious={() => setMonth((m) => addMonths(m, -1))}
            onNext={() => setMonth((m) => addMonths(m, 1))}
            onToday={() => setMonth(startOfMonth(new Date()))}
          />
          <Button onClick={() => setNewDate(today())}>Nueva sesión</Button>
        </>
      }
    >
      <ErrorMessage error={sessions.error} />
      {sessions.isPending && <Spinner />}
      <MonthCalendar
        month={month}
        days={grid.days}
        onDayClick={setNewDate}
        renderDay={(iso) =>
          (byDay.get(iso) ?? []).map((session) => (
            <Link
              key={session.id}
              to={`/gym/sessions/${session.id}`}
              className={cn('truncate rounded px-1.5 py-0.5 text-xs', STATUS_STYLES[session.status])}
            >
              {session.routine_id ? 'Rutina' : 'Entreno'} · {session.exercises.length} ej.
            </Link>
          ))
        }
      />
      <Modal open={newDate !== null} title="Nueva sesión" onClose={closeNew}>
        {newDate && (
          <NewSessionForm
            defaultDate={newDate}
            pending={create.isPending}
            error={create.error}
            onCancel={closeNew}
            onSubmit={(values) =>
              create.mutate(
                { ...values, status: 'planned', exercises: [] },
                { onSuccess: (session) => navigate(`/gym/sessions/${session.id}`) },
              )
            }
          />
        )}
      </Modal>
    </Card>
  )
}
