import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  BarChart2,
  Target,
  Settings,
} from 'lucide-react'
import { cn } from '@/utils/cn'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions', label: 'Lançamentos',  icon: ArrowLeftRight },
  { to: '/categories',   label: 'Categorias',   icon: Tag },
  { to: '/reports',      label: 'Relatórios',   icon: BarChart2 },
  { to: '/goals',        label: 'Metas',        icon: Target },
  { to: '/settings',     label: 'Config.',      icon: Settings },
]

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-dark min-h-screen fixed left-0 top-0">

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700">
          <span className="text-2xl">💰</span>
          <span className="text-white text-xl font-bold">Cashly</span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium',
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              )}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-slate-700">
          <p className="text-slate-400 text-xs text-center">Cashly v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark border-t border-slate-700 flex items-center justify-around px-2 py-2 z-50">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
              isActive ? 'text-primary' : 'text-slate-500'
            )}
          >
            <Icon size={22} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  )
}