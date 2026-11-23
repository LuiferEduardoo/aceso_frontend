import { useState, type FormEvent } from 'react'
import { ApiError } from '@/shared/api/errors'
import { Button, Card, ConfirmButton, ErrorMessage, Notice, Select, Spinner } from '@/shared/ui'
import type { GoogleCalendar } from '../../api/types'
import {
  useGoogleCalendars,
  useGoogleConnect,
  useGoogleDisconnect,
  useGoogleSync,
  useSelectGoogleCalendar,
} from '../../hooks/useGoogle'

const isNotConnected = (error: unknown) => error instanceof ApiError && error.status === 404

const calendarLabel = (calendar: GoogleCalendar) => (calendar.primary ? `${calendar.summary} (principal)` : calendar.summary)

/** Container: Google Calendar connect / calendar choice / sync / disconnect. */
export function GoogleCalendarPanel() {
  const calendars = useGoogleCalendars()
  const connect = useGoogleConnect()
  const select = useSelectGoogleCalendar()
  const sync = useGoogleSync()
  const disconnect = useGoogleDisconnect()
  const [calendarId, setCalendarId] = useState('')

  const writable = (calendars.data ?? []).filter((calendar) => calendar.writable)
  const selected = writable.find((calendar) => calendar.id === select.data?.calendar_id)
  const notConnected = isNotConnected(calendars.error)

  const submitCalendar = (event: FormEvent) => {
    event.preventDefault()
    if (calendarId) select.mutate(calendarId)
  }

  return (
    <Card title="Google Calendar">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-500">
          Al conectar se abre la página de autorización de Google. Tras aprobarla, el servidor muestra una breve confirmación en
          JSON en lugar de volver aquí: regresa a esta pestaña, elige el calendario y ejecuta una sincronización.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button loading={connect.isPending} onClick={() => connect.mutate()}>
            Conectar Google Calendar
          </Button>
          <ConfirmButton
            confirmLabel="Desconectar"
            variant="secondary"
            onConfirm={() => disconnect.mutate()}
            loading={disconnect.isPending}
          >
            Desconectar
          </ConfirmButton>
        </div>
        {calendars.isPending && <Spinner />}
        {notConnected && <p className="text-sm text-slate-500">No hay una cuenta de Google conectada.</p>}
        {calendars.error && !notConnected && <ErrorMessage error={calendars.error} />}
        {calendars.data && (
          <form onSubmit={submitCalendar} className="flex flex-wrap items-end gap-2" aria-label="Calendario de Google">
            <div className="min-w-56">
              <Select
                label="Calendario a sincronizar"
                placeholder="Elige un calendario…"
                options={writable.map((calendar) => ({ value: calendar.id, label: calendarLabel(calendar) }))}
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" disabled={!calendarId} loading={select.isPending}>
              Usar calendario
            </Button>
          </form>
        )}
        <div>
          <Button variant="secondary" loading={sync.isPending} onClick={() => sync.mutate()}>
            Sincronizar ahora
          </Button>
        </div>
        {select.isSuccess && <Notice>Calendario elegido: {selected ? selected.summary : select.data.calendar_id}.</Notice>}
        {sync.isSuccess && (
          <Notice>
            Sincronización completa: {sync.data.pulled} cambios recibidos, {sync.data.pushed} enviados y {sync.data.deleted}{' '}
            eliminados en Google.
          </Notice>
        )}
        {disconnect.isSuccess && <Notice>Google Calendar desconectado.</Notice>}
        <ErrorMessage error={connect.error ?? select.error ?? sync.error ?? disconnect.error} />
      </div>
    </Card>
  )
}
