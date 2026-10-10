import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'

const EMPTY = '—'

export function formatDate(value: string | null | undefined): string {
  if (!value) return EMPTY
  return format(parseISO(value), "EEE, d 'de' MMM 'de' yyyy", { locale: es })
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return EMPTY
  return format(parseISO(value), "d 'de' MMM 'de' yyyy HH:mm", { locale: es })
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return EMPTY
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.round(seconds % 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export function formatDistance(meters: number | null | undefined): string {
  if (meters == null) return EMPTY
  return meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${Math.round(meters)} m`
}

export function formatPace(secondsPerKm: number | null | undefined): string {
  if (secondsPerKm == null) return EMPTY
  return `${formatDuration(secondsPerKm)} /km`
}

/** Pace in s/km from an average speed in m/s. */
export function paceFromSpeed(metersPerSecond: number | null | undefined): number | null {
  if (!metersPerSecond) return null
  return Math.round(1000 / metersPerSecond)
}

export function formatNumber(value: number | null | undefined, suffix = ''): string {
  if (value == null) return EMPTY
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
}
