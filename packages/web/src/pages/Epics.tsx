import { Link } from 'react-router-dom'
import { useEpics, useChildren } from '../api/hooks'
import type { Issue } from '../api/hooks'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'

function EpicRow({ epic }: { epic: Issue }) {
  const { data: children = [] } = useChildren(epic.id)
  const total = children.length
  const closed = children.filter((c) => c.status === 'closed').length
  const blocked = children.filter((c) => c.status === 'blocked').length
  const pct = total > 0 ? Math.round((closed / total) * 100) : 0

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Epic header */}
      <div className="flex items-start gap-4 px-5 py-4">
        <div className="flex-1">
          <Link
            to={`/issues/${epic.id}`}
            className="font-semibold text-slate-800 hover:text-violet-600 dark:text-slate-200 dark:hover:text-violet-400"
          >
            {epic.title}
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">{epic.id}</span>
            <StatusBadge status={epic.status} />
            <PriorityBadge priority={epic.priority} />
            {blocked > 0 && (
              <span className="text-xs text-red-500">{blocked} blocked</span>
            )}
          </div>
        </div>
        <div className="text-right text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">{closed}/{total}</span>
          <span className="ml-1 text-slate-400">done</span>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="px-5 pb-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">{pct}% complete</p>
        </div>
      )}

      {/* Children list */}
      {children.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          {children.map((child) => (
            <Link
              key={child.id}
              to={`/issues/${child.id}`}
              className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <span className="font-mono text-xs text-slate-400">{child.id}</span>
              <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{child.title}</span>
              <StatusBadge status={child.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function Epics() {
  const { data: epics, isLoading } = useEpics()

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Epics</h1>

      {isLoading ? (
        <PageSpinner />
      ) : !epics || (epics as Issue[]).length === 0 ? (
        <EmptyState
          icon="⬡"
          title="No epics yet"
          description="Create an issue with type 'epic' to get started."
          action={
            <Link to="/issues" className="text-sm text-violet-600 hover:underline">
              Go to issues →
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {(epics as Issue[]).map((epic) => (
            <EpicRow key={epic.id} epic={epic} />
          ))}
        </div>
      )}
    </div>
  )
}
