import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), "d 'de' MMM", { locale: ptBR })
}

export function formatShortDate(dateString: string): string {
  return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatMonth(dateString: string): string {
  return format(parseISO(dateString), "MMM 'de' yyyy", { locale: ptBR })
}
