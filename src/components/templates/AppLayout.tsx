import { NavLink, Outlet } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  BarChart2,
  Target,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { auth } from '@/services/firebase'
import { cn } from '@/utils/cn'
import { useGoalNotifications } from '@/hooks'
import { NotificationBell } from '@/components/organisms/NotificationBell'
import { ThemeToggle } from '@/components/atoms'

const navItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions', label: 'Lançamentos',  icon: ArrowLeftRight },
  { to: '/categories',   label: 'Categorias',   icon: Tag },
  { to: '/reports',      label: 'Relatórios',   icon: BarChart2 },
  { to: '/goals',        label: 'Metas',        icon: Target },
  { to: '/settings',     label: 'Config.',      icon: Settings },
]

function UserAvatar({ photoURL, name }: { photoURL?: string | null; name?: string | null }) {
  if (photoURL) {
    return <img src={photoURL} alt={name ?? 'Usuário'} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10" />
  }
  return (
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-white/10">
      <span className="text-white text-xs font-bold">{name?.[0]?.toUpperCase() ?? 'U'}</span>
    </div>
  )
}

export function AppLayout() {
  const user = auth.currentUser
  const firstName = user?.displayName?.split(' ')[0] ?? 'Usuário'

  useGoalNotifications()

  function handleSignOut() {
    signOut(auth)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">

      {/* ── Notificações + tema (flutuante, visível em todas as telas) ── */}
      <div className="fixed top-4 right-4 md:top-6 md:right-8 z-40 flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell />
      </div>

      {/* ── Sidebar desktop ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#070D1A] min-h-screen fixed left-0 top-0 border-r border-white/[0.04]">

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-white font-bold text-sm tracking-tight">C</span>
          </div>
          <span className="text-white text-xl font-bold tracking-tight">Cashly</span>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-white/[0.06] mb-2" />

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-3 flex-1" aria-label="Navegação principal">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium relative group',
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" aria-hidden="true" />
                  )}
                  <Icon
                    size={18}
                    className={cn(
                      'transition-colors flex-shrink-0',
                      'group-[.active]:text-primary'
                    )}
                    aria-hidden="true"
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="mx-4 border-t border-white/[0.06] mt-2" />
        <div className="p-4">
          <div className="flex items-center gap-3">
            <UserAvatar photoURL={user?.photoURL} name={user?.displayName} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{firstName}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              aria-label="Sair da conta"
              className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Conteúdo principal ── */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>

      {/* ── Bottom nav mobile ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#070D1A] border-t border-white/[0.06] flex items-center justify-around px-2 py-2 z-50"
        aria-label="Navegação mobile"
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
              isActive ? 'text-primary' : 'text-slate-500'
            )}
          >
            <Icon size={20} aria-hidden="true" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
