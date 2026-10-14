import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { auth } from './firebase'

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// Instância única para chamar a API do Cashly. A URL vem de VITE_API_URL (.env.*).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
})

// Injeta o ID token do Firebase. Não sobrescreve um header já definido (ex.: retry após 401).
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user && !config.headers.Authorization) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Em 401, força a renovação do token e repete a requisição uma vez.
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetriableConfig | undefined
  const user = auth.currentUser

  if (error.response?.status === 401 && config && !config._retry && user) {
    config._retry = true
    const token = await user.getIdToken(true)
    config.headers.Authorization = `Bearer ${token}`
    return api.request(config)
  }

  return Promise.reject(error)
})
