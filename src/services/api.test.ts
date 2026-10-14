import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosError, type AxiosAdapter, type AxiosResponse } from 'axios'

const getIdToken = vi.fn()

vi.mock('./firebase', () => ({
  auth: { currentUser: { getIdToken: (force?: boolean) => getIdToken(force) } },
}))

const { api } = await import('./api')

function ok(config: Parameters<AxiosAdapter>[0]): AxiosResponse {
  return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
}

describe('api (axios)', () => {
  beforeEach(() => {
    getIdToken.mockReset()
  })

  it('injeta o token do Firebase no header Authorization', async () => {
    getIdToken.mockResolvedValue('token-1')
    let sentAuth: unknown
    api.defaults.adapter = async (config) => {
      sentAuth = config.headers.Authorization
      return ok(config)
    }

    await api.get('/transactions')

    expect(sentAuth).toBe('Bearer token-1')
  })

  it('em 401, renova o token forçando e repete a requisição uma vez', async () => {
    getIdToken.mockResolvedValueOnce('expired').mockResolvedValueOnce('fresh')
    const calls: unknown[] = []

    api.defaults.adapter = async (config) => {
      calls.push(config.headers.Authorization)
      if (calls.length === 1) {
        const response = { status: 401, statusText: 'Unauthorized', headers: {}, config, data: {} } as AxiosResponse
        throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, response)
      }
      return ok(config)
    }

    await api.get('/goals')

    expect(getIdToken).toHaveBeenLastCalledWith(true)
    expect(calls).toEqual(['Bearer expired', 'Bearer fresh'])
  })
})
