import { useState, type FormEvent } from 'react'
import { formatDateTime } from '@/shared/lib/format'
import { Button, Card, ConfirmButton, ErrorMessage, Notice, Select, Spinner } from '@/shared/ui'
import type { GoogleCalendar, GoogleStatus } from '../../api/types'
import {
  useGoogleCalendars,
  useGoogleConnect,
  useGoogleDisconnect,
  useGoogleStatus,
  useGoogleSync,
  useSelectGoogleCalendar,
} from '../../hooks/useGoogle'

const calendarLabel = (calendar: GoogleCalendar) => (calendar.primary ? `${calendar.summary} (principal)` : calendar.summary)

/** The link may hold the alias "primary"; the calendar list uses real ids. */
function currentCalendarId(status: GoogleStatus | undefined, calendars: GoogleCalendar[]): string {
  const linked = status?.calendar_id
  if (!linked) return ''
  const match = calendars.find((calendar) => calendar.id === linked || (linked === 'primary' && calendar.primary))
  return match?.id ?? ''
}

/** Container: Google Calendar connect / calendar choice / sync / disconnect. */
export function GoogleCalendarPanel() {
  const status = useGoogleStatus()
  const connected = status.data?.connected === true
  const calendars = useGoogleCalendars(connected)
  const connect = useGoogleConnect()
  const select = useSelectGoogleCalendar()
  const sync = useGoogleSync()
  const disconnect = useGoogleDisconnect()
  const [chosenId, setChosenId] = useState<string | null>(null)

  const writable = (calendars.data ?? []).filter((calendar) => calendar.writable)
  const calendarId = chosenId ?? currentCalendarId(status.data, writable)
  const selected = writable.find((calendar) => calendar.id === select.data?.calendar_id)

  const submitCalendar = (event: FormEvent) => {
    event.preventDefault()
    if (calendarId) select.mutate(calendarId)
  }

  return (
    <Card title="Google Calendar">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-500">
          Al conectar se abre la página de autorización de Google; tras aprobarla vuelves a esta agenda. Luego elige el
          calendario y ejecuta una sincronización.
        </p>
        {status.isPending && <Spinner />}
        <ErrorMessage error={status.error} />
        {status.data && !connected && (
          <>
            <p className="text-sm text-slate-500">No hay una cuenta de Google conectada.</p>
            <div>
              <Button loading={connect.isPending} onClick={() => connect.mutate()}>
                Conectar Google Calendar
              </Button>
            </div>
          </>
        )}
        {connected && (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {status.data?.last_synced_at
                ? `Última sincronización: ${formatDateTime(status.data.last_synced_at)}`
                : 'Aún no se ha sincronizado.'}
            </p>
            {calendars.isPending && <Spinner />}
            <ErrorMessage error={calendars.error} />
            {calendars.data && (
              <form onSubmit={submitCalendar} className="flex flex-wrap items-end gap-2" aria-label="Calendario de Google">
                <div className="min-w-56">
                  <Select
                    label="Calendario a sincronizar"
                    placeholder="Elige un calendario…"
                    options={writable.map((calendar) => ({ value: calendar.id, label: calendarLabel(calendar) }))}
                    value={calendarId}
                    onChange={(e) => setChosenId(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="secondary" disabled={!calendarId} loading={select.isPending}>
                  Usar calendario
                </Button>
              </form>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" loading={sync.isPending} onClick={() => sync.mutate()}>
                Sincronizar ahora
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
          </>
        )}
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
