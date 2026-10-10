import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { lastDays } from '@/shared/lib/dates'
import { Button, Card, ConfirmButton, DateRangePicker, ErrorMessage, Input, Notice } from '@/shared/ui'
import { MAX_GARMIN_SYNC_DAYS } from '../api/types'
import { useGarminConnect, useGarminDisconnect, useGarminSync } from '../hooks/useHealth'

const schema = z.object({
  email: z.string().trim().min(3, 'Introduce tu correo de Garmin'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

/** Container: Garmin Connect credentials and on-demand sync. */
export function GarminPanel() {
  const connect = useGarminConnect()
  const disconnect = useGarminDisconnect()
  const sync = useGarminSync()
  const [range, setRange] = useState(() => lastDays(7))
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  return (
    <Card title="Garmin">
      <div className="flex flex-col gap-4">
        <form
          noValidate
          aria-label="Conectar Garmin"
          className="flex flex-wrap items-end gap-2"
          onSubmit={handleSubmit((values) => connect.mutate(values, { onSuccess: () => reset() }))}
        >
          <Input label="Correo de Garmin" type="email" autoComplete="off" error={errors.email?.message} {...register('email')} />
          <Input label="Contraseña de Garmin" type="password" autoComplete="off" error={errors.password?.message} {...register('password')} />
          <Button type="submit" loading={connect.isPending}>
            Conectar
          </Button>
          <ConfirmButton confirmLabel="Desconectar" variant="secondary" loading={disconnect.isPending} onConfirm={() => disconnect.mutate()}>
            Desconectar
          </ConfirmButton>
        </form>
        <div>
          <p className="mb-1 text-sm font-medium">Sincronizar un rango de fechas (máx. {MAX_GARMIN_SYNC_DAYS} días)</p>
          <DateRangePicker
            value={range}
            maxDays={MAX_GARMIN_SYNC_DAYS}
            submitLabel="Sincronizar"
            pending={sync.isPending}
            onChange={(next) => {
              setRange(next)
              sync.mutate(next)
            }}
          />
        </div>
        {connect.isSuccess && <Notice>Garmin conectado.</Notice>}
        {disconnect.isSuccess && <Notice>Garmin desconectado.</Notice>}
        {sync.isSuccess && (
          <Notice>
            Se sincronizaron {sync.data.daily_summaries} resúmenes, {sync.data.samples} muestras y {sync.data.sleep_sessions} sesiones de sueño.
          </Notice>
        )}
        <ErrorMessage error={connect.error ?? disconnect.error ?? sync.error} />
      </div>
    </Card>
  )
}
