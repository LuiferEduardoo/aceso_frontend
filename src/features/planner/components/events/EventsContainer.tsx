import { addMonths, endOfMonth, startOfMonth } from 'date-fns'
import { useMemo, useState } from 'react'
import { toIsoDate, todayIn } from '@/shared/lib/dates'
import { Button, Card, EmptyState, ErrorMessage, Modal, MonthNavigator, QueryBoundary } from '@/shared/ui'
import { PLANNER_TIMEZONE, type CalendarEvent, type CalendarEventCreate } from '../../api/types'
import { useCreateEvent, useDeleteEvent, useEvents, useUpdateEvent } from '../../hooks/useEvents'
import { EventForm } from './EventForm'
import { EventList } from './EventList'

type Editing = { mode: 'create' } | { mode: 'edit'; event: CalendarEvent } | null

export function EventsContainer() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const range = useMemo(() => ({ from: toIsoDate(month), to: toIsoDate(endOfMonth(month)) }), [month])
  const events = useEvents(range)
  const create = useCreateEvent()
  const update = useUpdateEvent()
  const remove = useDeleteEvent()
  const [editing, setEditing] = useState<Editing>(null)

  const mutation = editing?.mode === 'edit' ? update : create
  const close = () => {
    setEditing(null)
    create.reset()
    update.reset()
  }
  const submit = (body: CalendarEventCreate) => {
    if (editing?.mode === 'edit') update.mutate({ id: editing.event.id, body }, { onSuccess: close })
    else create.mutate(body, { onSuccess: close })
  }

  return (
    <Card
      title="Eventos"
      actions={
        <>
          <MonthNavigator
            month={month}
            onPrevious={() => setMonth((m) => addMonths(m, -1))}
            onNext={() => setMonth((m) => addMonths(m, 1))}
            onToday={() => setMonth(startOfMonth(new Date()))}
          />
          <Button onClick={() => setEditing({ mode: 'create' })}>Nuevo evento</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <ErrorMessage error={remove.error} title="No se pudo eliminar el evento" />
        <QueryBoundary query={events}>
          {(list) =>
            list.length === 0 ? (
              <EmptyState title="No hay eventos este mes" />
            ) : (
              <EventList
                events={list}
                onEdit={(event) => setEditing({ mode: 'edit', event })}
                onDelete={(event) => remove.mutate(event.id)}
              />
            )
          }
        </QueryBoundary>
      </div>
      <Modal open={editing !== null} title={editing?.mode === 'edit' ? 'Editar evento' : 'Nuevo evento'} onClose={close}>
        {editing && (
          <EventForm
            initial={editing.mode === 'edit' ? editing.event : undefined}
            defaultDate={todayIn(PLANNER_TIMEZONE)}
            pending={mutation.isPending}
            error={mutation.error}
            onCancel={close}
            onSubmit={submit}
          />
        )}
      </Modal>
    </Card>
  )
}
