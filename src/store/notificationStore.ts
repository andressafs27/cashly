import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification } from '@/types'

interface NotificationStore {
  notifications: Notification[]
  addNotification: (n: Notification) => void
  markAsRead:      (id: string) => void
  markAllAsRead:   () => void
  clearAll:        () => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],

      addNotification: (n) =>
        set((s) => ({ notifications: [n, ...s.notifications] })),

      markAsRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
        })),

      markAllAsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
        })),

      clearAll: () => set({ notifications: [] }),
    }),
    { name: 'cashly_v1_notifications' }
  )
)
