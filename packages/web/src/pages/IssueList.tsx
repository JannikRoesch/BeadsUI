import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useIssues } from '../api/hooks'
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { formatRelative } from '../lib/utils'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
  { value: 'blocked', label: 'Blocked' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'task', label: 'Task' },
  { value: 'epic', label: 'Epic' },
  { value: 'chore', label: 'Chore' },
  { value: 'decision', label: 'Decision' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'All priorities' },
  { value: '0', label: 'P0 Critical' },
  { value: '1', label: 'P1 High' },
  { value: '2', label: 'P2 Medium' },
  { value: '3', label: 'P3 Low' },
  { value: '4', label: 'P4 Backlog' },
]

interface IssueListProps {
  onCreateIssue?: () => void
}

export function IssueList({ onCreateIssue }: IssueListProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') ?? ''
  const type = searchParams.get('type') ?? ''
  const priority = searchParams.get('priority') ?? ''

  const filters = Object.fromEntries(
    Object.entries({ status, type, priority }).filter(([, v]) => v !== ''),
  )

  const { data: issues = [], isLoading, error } = useIssues(filters)

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Issues
          {issues.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-400">({issues.length})</span>
          )}
        </h1>
        <Button size="sm" onClick={onCreateIssue}>+ New Issue</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setFilter('status', e.target.value)}
          className="w-36"
        />
        <Select
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => setFilter('type', e.target.value)}
          className="w-32"
        />
        <Select
          options={PRIORITY_OPTIONS}
          value={priority}
          onChange={(e) => setFilter('priority', e.target.value)}
          className="w-36"
        />
        {Object.keys(filters).length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setSearchParams({})}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Issue table */}
      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
          Failed to load issues. Is the API running?
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          icon="◎"
          title="No issues found"
          description="Try adjusting your filters or create a new issue."
          action={<Button size="sm" onClick={onCreateIssue}>Create issue</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
                <th className="px-4 py-2.5 font-medium">ID</th>
                <th className="px-4 py-2.5 font-medium">Title</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Priority</th>
                <th className="px-4 py-2.5 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {issues.map((issue) => (
                <tr
                  key={issue.id}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{issue.id}</td>
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/issues/${issue.id}`}
                      className="font-medium text-slate-800 hover:text-violet-600 dark:text-slate-200 dark:hover:text-violet-400"
                    >
                      {issue.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5"><StatusBadge status={issue.status} /></td>
                  <td className="px-4 py-2.5"><TypeBadge type={issue.issue_type} /></td>
                  <td className="px-4 py-2.5"><PriorityBadge priority={issue.priority} /></td>
                  <td className="px-4 py-2.5 text-xs text-slate-400">{formatRelative(issue.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
