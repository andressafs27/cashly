import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  currency: string
  theme: 'light' | 'dark'
  userName: string
  userEmail: string
  setCurrency: (currency: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  setUserName: (name: string) => void
  setUserEmail: (email: string) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      currency: 'BRL',
      theme: 'light',
      userName: '',
      userEmail: '',
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
      setUserName: (userName) => set({ userName }),
      setUserEmail: (userEmail) => set({ userEmail }),
    }),
    { name: 'cashly_v1_settings' }
  )
)