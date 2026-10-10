import { describe, expect, it } from 'vitest'
import { parseClock, toClock } from './clock'

describe('clock helpers', () => {
  it('parses seconds, mm:ss and h:mm:ss', () => {
    expect(parseClock('45')).toBe(45)
    expect(parseClock('5:30')).toBe(330)
    expect(parseClock('1:05:00')).toBe(3900)
  })

  it('rejects malformed values', () => {
    expect(parseClock('5:75')).toBeNull()
    expect(parseClock('abc')).toBeNull()
  })

  it('formats seconds back to a clock string', () => {
    expect(toClock(330)).toBe('5:30')
    expect(toClock(3900)).toBe('1:05:00')
    expect(toClock(null)).toBe('')
  })
})
