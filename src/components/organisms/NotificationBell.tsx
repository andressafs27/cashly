import { useState, useRef, useEffect } from 'react'
import { Bell, Target, AlertTriangle, Clock, type LucideIcon } from 'lucide-react'
import { useNotificationStore } from '@/store'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import type { NotificationType } from '@/types'

const ICONS: Record<NotificationType, LucideIcon> = {
  achieved:         Target,
  exceeded:         AlertTriangle,
  limit_warning:    AlertTriangle,
  deadline_warning: Clock,
}

const STYLES: Record<NotificationType, string> = {
  achieved:         'text-accent bg-accent/10',
  exceeded:         'text-danger bg-danger/10',
  limit_warning:    'text-warning bg-warning/10',
  deadline_warning: 'text-primary bg-primary/10',
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function listener(e: MouseEvent) {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

export function NotificationBell() {
  const notifications   = useNotificationStore((s) => s.notifications)
  const markAsRead      = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead   = useNotificationStore((s) => s.markAllAsRead)

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `Notificações, ${unreadCount} não lidas` : 'Notificações'}
        aria-expanded={open}
        className="relative w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
      >
        <Bell size={18} className="text-mid" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="region"
          aria-label="Lista de notificações"
          className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[70vh] overflow-y-auto z-50"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
            <p className="text-dark font-semibold text-sm">Notificações</p>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                Marcar todas como lidas
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell size={24} className="text-light mx-auto mb-2" aria-hidden="true" />
              <p className="text-light text-sm">Nenhuma notificação ainda</p>
            </div>
          ) : (
            <div>
              {notifications.map((n) => {
                const Icon = ICONS[n.type]
                return (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors',
                      !n.isRead && 'bg-primary/5'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', STYLES[n.type])}>
                      <Icon size={15} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm leading-snug', !n.isRead ? 'text-dark font-medium' : 'text-mid')}>
                        {n.message}
                      </p>
                      <p className="text-light text-xs mt-1">{formatDate(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" aria-hidden="true" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
