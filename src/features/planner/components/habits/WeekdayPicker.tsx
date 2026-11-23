import { Checkbox } from '@/shared/ui'
import { WEEKDAY_LABELS } from '../../api/types'

interface WeekdayPickerProps {
  /** Backend weekdays: 0 = Monday .. 6 = Sunday. */
  value: number[]
  onChange: (value: number[]) => void
  error?: string
}

export function WeekdayPicker({ value, onChange, error }: WeekdayPickerProps) {
  const toggle = (day: number, checked: boolean) =>
    onChange(checked ? [...value, day].sort((a, b) => a - b) : value.filter((d) => d !== day))

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">Días</legend>
      <div className="flex flex-wrap gap-3">
        {WEEKDAY_LABELS.map((label, day) => (
          <Checkbox key={label} label={label} checked={value.includes(day)} onChange={(e) => toggle(day, e.target.checked)} />
        ))}
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  )
}
