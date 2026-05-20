import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-slate-200 rounded-xl', className)} aria-hidden="true" />
  )
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3 animate-pulse" aria-hidden="true">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-slate-200" />
        <div className="w-14 h-6 rounded-full bg-slate-200" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="w-24 h-3 rounded-lg bg-slate-200" />
        <div className="w-36 h-8 rounded-lg bg-slate-200" />
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-200" />
      <div className="w-40 h-3 rounded-lg bg-slate-200" />
    </div>
  )
}

export function SkeletonChartCard({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-pulse', className)} aria-hidden="true">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-2">
          <div className="w-32 h-4 rounded-lg bg-slate-200" />
          <div className="w-20 h-3 rounded-lg bg-slate-200" />
        </div>
      </div>
      <div className="w-full h-[200px] rounded-xl bg-slate-100" />
    </div>
  )
}

export function SkeletonTransactionRow() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0 animate-pulse" aria-hidden="true">
      <div className="w-9 h-9 rounded-xl bg-slate-200 flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="w-32 h-3.5 rounded-lg bg-slate-200" />
        <div className="w-24 h-3 rounded-lg bg-slate-200" />
      </div>
      <div className="w-20 h-4 rounded-lg bg-slate-200" />
    </div>
  )
}
