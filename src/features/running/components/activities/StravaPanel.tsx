import { useState, type FormEvent } from 'react'
import { localInputToIso } from '@/shared/lib/dates'
import { Button, Card, ConfirmButton, ErrorMessage, Input, Notice } from '@/shared/ui'
import { useStravaConnect, useStravaDisconnect, useStravaSync } from '../../hooks/useActivities'

/** Container: Strava connect / sync / disconnect actions. */
export function StravaPanel() {
  const connect = useStravaConnect()
  const sync = useStravaSync()
  const disconnect = useStravaDisconnect()
  const [after, setAfter] = useState('')

  const submitSync = (event: FormEvent) => {
    event.preventDefault()
    sync.mutate(after ? localInputToIso(after) : undefined)
  }

  return (
    <Card title="Strava">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-500">
          Al conectar se abre la página de autorización de Strava. Tras aprobarla, el servidor muestra una breve confirmación
          en JSON en lugar de volver aquí: regresa a esta pestaña y ejecuta una sincronización.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button loading={connect.isPending} onClick={() => connect.mutate()}>
            Conectar Strava
          </Button>
          <ConfirmButton confirmLabel="Desconectar" variant="secondary" onConfirm={() => disconnect.mutate()} loading={disconnect.isPending}>
            Desconectar
          </ConfirmButton>
        </div>
        <form onSubmit={submitSync} className="flex flex-wrap items-end gap-2" aria-label="Sincronizar Strava">
          <Input
            label="Solo actividades posteriores a (opcional)"
            type="datetime-local"
            value={after}
            onChange={(e) => setAfter(e.target.value)}
          />
          <Button type="submit" variant="secondary" loading={sync.isPending}>
            Sincronizar ahora
          </Button>
        </form>
        {sync.isSuccess && <Notice>Se sincronizaron {sync.data} actividades.</Notice>}
        {disconnect.isSuccess && <Notice>Strava desconectado.</Notice>}
        <ErrorMessage error={connect.error ?? sync.error ?? disconnect.error} />
      </div>
    </Card>
  )
}
