import { useState, type FormEvent } from 'react'
import { rangeLengthDays, type DateRange } from '@/shared/lib/dates'
import { Button } from './Button'
import { Input } from './Input'

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  maxDays?: number
  submitLabel?: string
  pending?: boolean
}

/** Two date inputs applied together, validating order and maximum length. */
export function DateRangePicker({ value, onChange, maxDays, submitLabel = 'Aplicar', pending }: DateRangePickerProps) {
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState<string>()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.from || !draft.to) return setError('Elige ambas fechas.')
    if (draft.from > draft.to) return setError('"Desde" debe ser igual o anterior a "Hasta".')
    if (maxDays && rangeLengthDays(draft.from, draft.to) > maxDays) {
      return setError(`El rango puede abarcar como máximo ${maxDays} días.`)
    }
    setError(undefined)
    onChange(draft)
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2" aria-label={`Rango de fechas: ${submitLabel}`}>
      <Input
        label="Desde"
        type="date"
        value={draft.from}
        onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
      />
      <Input
        label="Hasta"
        type="date"
        value={draft.to}
        onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
      />
      <Button type="submit" variant="secondary" loading={pending}>
        {submitLabel}
      </Button>
      {error && (
        <p role="alert" className="w-full text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  )
}
