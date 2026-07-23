import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="w-10 h-10 bg-surface border border-slate-200 dark:border-slate-700 rounded-full shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
    >
      {theme === 'dark'
        ? <Sun size={18} className="text-warning" aria-hidden="true" />
        : <Moon size={18} className="text-mid" aria-hidden="true" />
      }
    </button>
  )
}
