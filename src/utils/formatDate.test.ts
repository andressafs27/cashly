import { describe, it, expect } from 'vitest'
import { formatDate, formatShortDate, formatMonth } from './formatDate'

describe('formatDate', () => {
  it('formata data no padrão "d de MMM"', () => {
    expect(formatDate('2026-03-05')).toBe('5 de mar')
  })
})

describe('formatShortDate', () => {
  it('formata data no padrão dd/MM/yyyy', () => {
    expect(formatShortDate('2026-03-05')).toBe('05/03/2026')
  })
})

describe('formatMonth', () => {
  it('formata data no padrão "MMM de yyyy"', () => {
    expect(formatMonth('2026-03-05')).toBe('mar de 2026')
  })
})
