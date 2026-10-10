import { useState, type ChangeEvent } from 'react'
import { z } from 'zod'
import { Button, Card, ErrorMessage, Notice } from '@/shared/ui'
import { HEALTH_SOURCES, type IngestRequest } from '../api/types'
import { useIngest } from '../hooks/useHealth'

/** Shallow client-side check; the backend validates every record in depth. */
const ingestShape = z.object({
  source: z.enum(HEALTH_SOURCES as [string, ...string[]], { error: `source debe ser uno de: ${HEALTH_SOURCES.join(', ')}` }),
  daily_summaries: z.array(z.record(z.string(), z.unknown())).optional(),
  samples: z.array(z.record(z.string(), z.unknown())).optional(),
  sleep_sessions: z.array(z.record(z.string(), z.unknown())).optional(),
})

async function readPayload(file: File): Promise<IngestRequest> {
  let json: unknown
  try {
    json = JSON.parse(await file.text())
  } catch {
    throw new Error('El archivo no es un JSON válido.')
  }
  const parsed = ingestShape.safeParse(json)
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => `${i.path.join('.') || 'archivo'}: ${i.message}`).join('; '))
  return json as IngestRequest
}

/** Container: uploads a bulk health JSON file to /health/ingest. */
export function IngestPanel() {
  const ingest = useIngest()
  const [payload, setPayload] = useState<IngestRequest | null>(null)
  const [fileError, setFileError] = useState<unknown>(null)

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    ingest.reset()
    setPayload(null)
    setFileError(null)
    if (!file) return
    try {
      setPayload(await readPayload(file))
    } catch (error) {
      setFileError(error)
    }
  }

  return (
    <Card title="Importar JSON">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-500">
          Sube un archivo con esta forma: <code>{'{ "source": "manual", "daily_summaries": [], "samples": [], "sleep_sessions": [] }'}</code>.
        </p>
        <label className="w-fit cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
          Elegir archivo JSON
          <input type="file" accept="application/json,.json" className="sr-only" onChange={onFile} />
        </label>
        {payload && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span>
              Origen <strong>{payload.source}</strong>: {payload.daily_summaries?.length ?? 0} resúmenes,{' '}
              {payload.samples?.length ?? 0} muestras, {payload.sleep_sessions?.length ?? 0} sesiones de sueño.
            </span>
            <Button loading={ingest.isPending} onClick={() => ingest.mutate(payload)}>
              Importar
            </Button>
          </div>
        )}
        {ingest.isSuccess && (
          <Notice>
            Se importaron {ingest.data.daily_summaries} resúmenes, {ingest.data.samples} muestras y {ingest.data.sleep_sessions} sesiones de sueño.
          </Notice>
        )}
        <ErrorMessage error={fileError ?? ingest.error} />
      </div>
    </Card>
  )
}
