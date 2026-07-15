import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('junta múltiplas classes em uma string', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('ignora valores falsy', () => {
    expect(cn('a', false, undefined, null, '', 'b')).toBe('a b')
  })

  it('resolve classes condicionais em objeto', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
  })
})
