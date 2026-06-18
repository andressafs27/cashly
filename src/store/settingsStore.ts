import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  currency:       string
  theme:          'light' | 'dark'
  themeSetByUser: boolean
  userName:       string
  userEmail:      string
  setCurrency:    (currency: string) => void
  setTheme:       (theme: 'light' | 'dark') => void
  setThemeManual: (theme: 'light' | 'dark') => void
  setUserName:    (name: string) => void
  setUserEmail:   (email: string) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      currency:       'BRL',
      theme:          'light',
      themeSetByUser: false,
      userName:       '',
      userEmail:      '',
      setCurrency:    (currency) => set({ currency }),
      // Definido automaticamente (ex: detecção de preferência do sistema)
      setTheme:       (theme) => set({ theme }),
      // Definido manualmente pelo usuário — não será mais sobrescrito pela preferência do sistema
      setThemeManual: (theme) => set({ theme, themeSetByUser: true }),
      setUserName:    (userName) => set({ userName }),
      setUserEmail:   (userEmail) => set({ userEmail }),
    }),
    { name: 'cashly_v1_settings' }
  )
)
