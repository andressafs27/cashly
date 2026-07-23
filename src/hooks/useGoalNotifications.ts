import { useEffect } from 'react'
import { toast } from 'sonner'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useGoalStore, useTransactionStore, useNotificationStore } from '@/store'
import { getEffectiveCurrentAmount, getGoalProgress } from '@/utils/goalProgress'
import type { Notification, NotificationType } from '@/types'

/**
 * Verifica todas as metas ativas e dispara notificações (toast + persistidas)
 * quando alguma condição é atingida pela primeira vez:
 * - meta de economizar atingida (100%)
 * - meta de limite ultrapassada (>100%)
 * - meta de limite perto do limite (80%+)
 * - prazo a 7 dias ou menos (não concluída)
 *
 * Cada condição só notifica uma vez por meta (verificado contra notificações
 * já persistidas no store).
 */
export function useGoalNotifications() {
  const goals         = useGoalStore((s) => s.goals)
  const transactions   = useTransactionStore((s) => s.transactions)
  const notifications  = useNotificationStore((s) => s.notifications)
  const addNotification = useNotificationStore((s) => s.addNotification)

  useEffect(() => {
    const activeGoals = goals.filter((g) => !g.isArchived)

    function hasNotification(goalId: string, type: NotificationType): boolean {
      return notifications.some((n) => n.goalId === goalId && n.type === type)
    }

    function notify(goalId: string, type: NotificationType, message: string) {
      if (hasNotification(goalId, type)) return
      const notification: Notification = {
        id: crypto.randomUUID(),
        goalId,
        type,
        message,
        createdAt: new Date().toISOString(),
        isRead: false,
      }
      addNotification(notification)
      toast(message, { duration: 6000 })
    }

    activeGoals.forEach((goal) => {
      const currentAmount = getEffectiveCurrentAmount(goal, transactions)
      const progress       = getGoalProgress(goal.targetAmount, currentAmount)
      const daysLeft        = differenceInCalendarDays(parseISO(goal.deadline), new Date())

      if (goal.type === 'save') {
        if (progress >= 100) {
          notify(goal.id, 'achieved', `Meta "${goal.title}" atingida! 🎉`)
        }
      } else {
        if (progress > 100) {
          notify(goal.id, 'exceeded', `Limite de "${goal.title}" foi ultrapassado!`)
        } else if (progress >= 80) {
          notify(goal.id, 'limit_warning', `Você já usou 80% do limite de "${goal.title}"`)
        }
      }

      if (daysLeft <= 7 && daysLeft >= 0 && progress < 100) {
        notify(goal.id, 'deadline_warning',
          `Faltam ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} para o prazo de "${goal.title}"`)
      }
    })
  }, [goals, transactions]) // eslint-disable-line react-hooks/exhaustive-deps
}
