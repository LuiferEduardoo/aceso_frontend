import { format, isSameMonth, isToday } from 'date-fns'
import { es } from 'date-fns/locale/es'
import type { ReactNode } from 'react'
import { toIsoDate } from '@/shared/lib/dates'
import { cn } from '@/shared/lib/cn'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

interface MonthCalendarProps {
  month: Date
  days: Date[]
  renderDay: (isoDate: string) => ReactNode
  onDayClick?: (isoDate: string) => void
}

/** Presentational month grid; the content of each day is supplied by the caller. */
export function MonthCalendar({ month, days, renderDay, onDayClick }: MonthCalendarProps) {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[42rem] grid-cols-7 gap-px rounded-md bg-slate-200 dark:bg-slate-700">
        {WEEKDAYS.map((day) => (
          <div key={day} className="bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500 dark:bg-slate-900">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const iso = toIsoDate(day)
          return (
            <div
              key={iso}
              className={cn(
                'min-h-24 bg-white p-1.5 dark:bg-slate-900',
                !isSameMonth(day, month) && 'bg-slate-50 text-slate-400 dark:bg-slate-950',
              )}
            >
              <button
                type="button"
                onClick={() => onDayClick?.(iso)}
                aria-label={`Añadir el ${format(day, "d 'de' MMMM", { locale: es })}`}
                className={cn(
                  'mb-1 rounded px-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800',
                  isToday(day) && 'bg-emerald-600 font-semibold text-white hover:bg-emerald-700',
                )}
              >
                {format(day, 'd')}
              </button>
              <div className="flex flex-col gap-1">{renderDay(iso)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
