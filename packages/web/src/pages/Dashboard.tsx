import { Link } from 'react-router-dom'
import { useReady, useStats, useIssues } from '../api/hooks'
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { formatRelative } from '../lib/utils'

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: ready = [], isLoading: readyLoading } = useReady()
  const { data: stale = [] } = useIssues({ status: 'open' })

  const s = stats as Record<string, number> | undefined

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>

      {/* Stats cards */}
      {statsLoading ? (
        <PageSpinner />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Open', value: s?.['open'] ?? 0, color: 'text-emerald-600' },
            { label: 'In Progress', value: s?.['in_progress'] ?? 0, color: 'text-blue-600' },
            { label: 'Blocked', value: s?.['blocked'] ?? 0, color: 'text-red-600' },
            { label: 'Closed', value: s?.['closed'] ?? 0, color: 'text-slate-500' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Ready to work */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Ready to Work</h2>
          <Link to="/issues?status=open" className="text-sm text-violet-600 hover:underline dark:text-violet-400">
            View all →
          </Link>
        </div>

        {readyLoading ? (
          <PageSpinner />
        ) : ready.length === 0 ? (
          <EmptyState icon="✓" title="No unblocked issues" description="All open issues are either in progress or blocked." />
        ) : (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {ready.slice(0, 5).map((issue) => (
              <Link
                key={issue.id}
                to={`/issues/${issue.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span className="w-20 font-mono text-xs text-slate-400">{issue.id}</span>
                <span className="flex-1 text-sm text-slate-800 dark:text-slate-200">{issue.title}</span>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={issue.priority} />
                  <TypeBadge type={issue.issue_type} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Recent Issues</h2>
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {stale.slice(0, 5).map((issue) => (
            <Link
              key={issue.id}
              to={`/issues/${issue.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <span className="w-20 font-mono text-xs text-slate-400">{issue.id}</span>
              <span className="flex-1 text-sm text-slate-800 dark:text-slate-200">{issue.title}</span>
              <StatusBadge status={issue.status} />
              <span className="text-xs text-slate-400">{formatRelative(issue.updated_at)}</span>
            </Link>
          ))}
          {stale.length === 0 && (
            <EmptyState icon="📭" title="No issues yet" description="Create your first issue to get started." />
          )}
        </div>
      </section>
    </div>
  )
}
