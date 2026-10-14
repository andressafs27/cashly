import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AxiosAdapter, AxiosResponse } from 'axios'

vi.mock('./firebase', () => ({ auth: { currentUser: null } }))

const { api } = await import('./api')
const { fetchTransactions, fetchGoals, fetchCategories, createTransaction } = await import('./resources')

function respond(data: unknown): AxiosAdapter {
  return async (config) => ({ data, status: 200, statusText: 'OK', headers: {}, config }) as AxiosResponse
}

describe('resources (conversão da API)', () => {
  beforeEach(() => {
    api.defaults.adapter = respond([])
  })

  it('converte amount de string (Decimal) para number e goalId nulo para undefined', async () => {
    api.defaults.adapter = respond([
      { id: 't1', type: 'expense', amount: '120.50', description: 'Mercado', date: '2026-10-01T00:00:00.000Z', createdAt: '2026-10-01T10:00:00.000Z', categoryId: 'c1', goalId: null },
    ])

    const [t] = await fetchTransactions()

    expect(t.amount).toBe(120.5)
    expect(typeof t.amount).toBe('number')
    expect(t.goalId).toBeUndefined()
  })

  it('converte valores de metas (targetAmount e currentAmount) para number', async () => {
    api.defaults.adapter = respond([
      { id: 'g1', title: 'Viagem', description: null, type: 'save', targetAmount: '5000.00', currentAmount: '1200.25', deadline: '2027-01-01T00:00:00.000Z', categoryId: null, isArchived: false },
    ])

    const [g] = await fetchGoals()

    expect(g.targetAmount).toBe(5000)
    expect(g.currentAmount).toBe(1200.25)
    expect(g.description).toBeUndefined()
  })

  it('preenche os campos que a API ainda não tem em categorias', async () => {
    api.defaults.adapter = respond([{ id: 'c1', name: 'Mercado', color: '#00C48C', icon: 'shopping-cart', isDefault: true, userId: 'u1' }])

    const [c] = await fetchCategories()

    expect(c).toMatchObject({ id: 'c1', type: 'expense', isActive: true, subcategories: [] })
  })

  it('envia goalId como null quando a transação não tem meta', async () => {
    let sent: unknown
    api.defaults.adapter = async (config) => {
      sent = JSON.parse(config.data as string)
      return { data: { id: 't2', type: 'income', amount: '10', description: 'x', date: '', createdAt: '', categoryId: 'c1', goalId: null }, status: 201, statusText: 'Created', headers: {}, config } as AxiosResponse
    }

    await createTransaction({ type: 'income', amount: 10, description: 'x', date: '2026-10-01', categoryId: 'c1' })

    expect(sent).toMatchObject({ goalId: null })
  })
})
