import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variant === 'outline' && 'border border-current bg-transparent',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    blocked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }
  return <Badge className={colors[status] ?? colors['open']}>{status.replace('_', ' ')}</Badge>
}

export function PriorityBadge({ priority }: { priority: number }) {
  const labels = ['Critical', 'High', 'Medium', 'Low', 'Backlog']
  const colors = [
    'bg-red-500 text-white',
    'bg-orange-500 text-white',
    'bg-yellow-600 text-white',
    'bg-blue-500 text-white',
    'bg-slate-400 text-white',
  ]
  return (
    <Badge className={colors[priority] ?? colors[2]}>P{priority} {labels[priority]}</Badge>
  )
}

export function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    bug: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    feature: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    task: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    epic: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
    chore: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    decision: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  }
  return <Badge className={colors[type] ?? colors['task']}>{type}</Badge>
}
