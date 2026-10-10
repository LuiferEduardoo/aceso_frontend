import { z } from 'zod'

const toOptionalNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(parsed) ? value : parsed
}

/** Optional numeric form field: empty input becomes `undefined`. */
export function optionalNumber(schema: z.ZodNumber = z.number()) {
  return z.preprocess(toOptionalNumber, schema.optional())
}

export function requiredNumber(schema: z.ZodNumber = z.number()) {
  return z.preprocess(toOptionalNumber, schema)
}

/** Optional text field: blank input becomes `undefined`. */
export const optionalText = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().optional(),
)

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige una fecha')

/** Converts `undefined` into `null` so PATCH payloads clear optional fields. */
export function orNull<T>(value: T | undefined): T | null {
  return value === undefined ? null : value
}

/** Converts a number/undefined into a string for form default values. */
export function numberToInput(value: number | null | undefined): string {
  return value == null ? '' : String(value)
}
