import { addMonths, format, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { useMemo, useState } from 'react'
import { monthGrid, parseIsoDate } from '@/shared/lib/dates'
import { Card, ErrorMessage, Modal, MonthCalendar, MonthNavigator, Spinner } from '@/shared/ui'
import type { AgendaDay, CalendarEvent, CalendarEventCreate } from '../../api/types'
import { useAgenda } from '../../hooks/useAgenda'
import { useCreateEvent, useUpdateEvent } from '../../hooks/useEvents'
import { EventForm } from '../events/EventForm'
import { AgendaDayChips } from './AgendaDayChips'
import { AgendaDayDetail } from './AgendaDayDetail'

type Dialog =
  | { kind: 'day'; date: string }
  | { kind: 'new-event'; date: string }
  | { kind: 'edit-event'; date: string; event: CalendarEvent }
  | null

const emptyDay = (date: string): AgendaDay => ({ date, events: [], tasks: [], habits: [] })
const longDate = (iso: string) => format(parseIsoDate(iso), "EEEE d 'de' MMMM", { locale: es })

export function AgendaContainer() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const grid = useMemo(() => monthGrid(month), [month])
  const agenda = useAgenda(grid.range)
  const create = useCreateEvent()
  const update = useUpdateEvent()
  const [dialog, setDialog] = useState<Dialog>(null)

  const byDay = useMemo(() => new Map((agenda.data ?? []).map((day) => [day.date, day])), [agenda.data])

  const mutation = dialog?.kind === 'edit-event' ? update : create
  const close = () => {
    setDialog(null)
    create.reset()
    update.reset()
  }
  const backToDay = () => {
    if (dialog) setDialog({ kind: 'day', date: dialog.date })
    create.reset()
    update.reset()
  }
  const submit = (body: CalendarEventCreate) => {
    if (dialog?.kind === 'edit-event') update.mutate({ id: dialog.event.id, body }, { onSuccess: backToDay })
    else create.mutate(body, { onSuccess: backToDay })
  }

  const title =
    dialog?.kind === 'new-event' ? 'Nuevo evento' : dialog?.kind === 'edit-event' ? 'Editar evento' : dialog ? `Agenda del ${longDate(dialog.date)}` : ''

  return (
    <Card
      title="Agenda"
      actions={
        <MonthNavigator
          month={month}
          onPrevious={() => setMonth((m) => addMonths(m, -1))}
          onNext={() => setMonth((m) => addMonths(m, 1))}
          onToday={() => setMonth(startOfMonth(new Date()))}
        />
      }
    >
      <ErrorMessage error={agenda.error} />
      {agenda.isPending && <Spinner />}
      <MonthCalendar
        month={month}
        days={grid.days}
        dayLabel={(day) => `Ver el ${format(day, "d 'de' MMMM", { locale: es })}`}
        onDayClick={(date) => setDialog({ kind: 'day', date })}
        renderDay={(iso) => {
          const day = byDay.get(iso)
          return day ? <AgendaDayChips day={day} /> : null
        }}
      />
      <Modal open={dialog !== null} title={title} onClose={close}>
        {dialog?.kind === 'day' && (
          <AgendaDayDetail
            day={byDay.get(dialog.date) ?? emptyDay(dialog.date)}
            onNewEvent={() => setDialog({ kind: 'new-event', date: dialog.date })}
            onEditEvent={(event) => setDialog({ kind: 'edit-event', date: dialog.date, event })}
          />
        )}
        {(dialog?.kind === 'new-event' || dialog?.kind === 'edit-event') && (
          <EventForm
            initial={dialog.kind === 'edit-event' ? dialog.event : undefined}
            defaultDate={dialog.date}
            pending={mutation.isPending}
            error={mutation.error}
            onCancel={backToDay}
            onSubmit={submit}
          />
        )}
      </Modal>
    </Card>
  )
}
