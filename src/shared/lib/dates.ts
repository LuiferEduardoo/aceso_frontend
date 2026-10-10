import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'date-fns'

export interface DateRange {
  from: string
  to: string
}

/** Formats a Date as an ISO calendar date (yyyy-MM-dd) in local time. */
export function toIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function today(): string {
  return toIsoDate(new Date())
}

export function parseIsoDate(value: string): Date {
  return parseISO(value)
}

/** Inclusive number of days covered by a date range. */
export function rangeLengthDays(from: string, to: string): number {
  return differenceInCalendarDays(parseISO(to), parseISO(from)) + 1
}

export function lastDays(days: number, end: Date = new Date()): DateRange {
  return { from: toIsoDate(subDays(end, days - 1)), to: toIsoDate(end) }
}

/** The visible grid of a month calendar (whole weeks, Monday first). */
export function monthGrid(month: Date): { range: DateRange; days: Date[] } {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const days: Date[] = []
  for (let day = start; day <= end; day = addDays(day, 1)) days.push(day)
  return { range: { from: toIsoDate(start), to: toIsoDate(end) }, days }
}

/** Converts a `datetime-local` input value into an aware ISO datetime. */
export function localInputToIso(value: string): string {
  return new Date(value).toISOString()
}

/** Converts a Date into a `datetime-local` input value. */
export function toLocalInput(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}
