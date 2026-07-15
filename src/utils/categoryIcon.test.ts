import { describe, it, expect } from 'vitest'
import { MoreHorizontal } from 'lucide-react'
import { getCategoryIcon, ICON_MAP, AVAILABLE_ICONS } from './categoryIcon'

describe('getCategoryIcon', () => {
  it('retorna o ícone correto para um nome conhecido', () => {
    expect(getCategoryIcon('Wallet')).toBe(ICON_MAP.Wallet)
  })

  it('retorna MoreHorizontal como fallback para nomes desconhecidos', () => {
    expect(getCategoryIcon('IconeQueNaoExiste')).toBe(MoreHorizontal)
  })
})

describe('AVAILABLE_ICONS', () => {
  it('contém todas as chaves do ICON_MAP', () => {
    expect(AVAILABLE_ICONS.length).toBe(Object.keys(ICON_MAP).length)
    expect(AVAILABLE_ICONS).toContain('Wallet')
  })
})
