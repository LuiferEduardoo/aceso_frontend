/** Parses "ss", "mm:ss" or "hh:mm:ss" into seconds; returns null when the text is not a clock value. */
export function parseClock(text: string): number | null {
  const trimmed = text.trim()
  if (!/^\d+(:\d{1,2}){0,2}$/.test(trimmed)) return null
  const parts = trimmed.split(':').map(Number)
  if (parts.slice(1).some((part) => part >= 60)) return null
  return parts.reduce((total, part) => total * 60 + part, 0)
}

/** Formats seconds as "h:mm:ss" or "m:ss" for clock inputs. */
export function toClock(seconds: number | null | undefined): string {
  if (seconds == null) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}
