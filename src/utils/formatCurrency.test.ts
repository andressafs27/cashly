import { describe, it, expect } from 'vitest'
import { formatCurrency } from './formatCurrency'

describe('formatCurrency', () => {
  it('formata um valor inteiro em BRL', () => {
    expect(formatCurrency(1500)).toBe('R$ 1.500,00')
  })

  it('formata centavos corretamente', () => {
    expect(formatCurrency(19.9)).toBe('R$ 19,90')
  })

  it('formata zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })

  it('formata valores negativos', () => {
    expect(formatCurrency(-120)).toBe('-R$ 120,00')
  })

  it('formata valores grandes com separador de milhar', () => {
    expect(formatCurrency(1234567.89)).toBe('R$ 1.234.567,89')
  })
})
