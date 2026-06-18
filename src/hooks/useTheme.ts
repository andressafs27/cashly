import { useEffect } from 'react'
import { useSettingsStore } from '@/store'

/**
 * Aplica o tema (claro/escuro) na raiz do documento e detecta a preferência
 * do sistema operacional na primeira visita (apenas se o usuário nunca
 * escolheu manualmente um tema).
 */
export function useTheme() {
  const theme          = useSettingsStore((s) => s.theme)
  const themeSetByUser = useSettingsStore((s) => s.themeSetByUser)
  const setTheme       = useSettingsStore((s) => s.setTheme)
  const setThemeManual = useSettingsStore((s) => s.setThemeManual)

  // Detecta preferência do sistema apenas se o usuário nunca escolheu manualmente
  useEffect(() => {
    if (themeSetByUser) return
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }, [themeSetByUser, setTheme])

  // Aplica/remove a classe .dark no <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggleTheme() {
    setThemeManual(theme === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggleTheme }
}
