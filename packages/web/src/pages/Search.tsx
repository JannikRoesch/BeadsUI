import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSearch } from '../api/hooks'
import { StatusBadge, TypeBadge, PriorityBadge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'

function useDebounce<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value)
  const timeout = useCallback(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  // Run on mount and when value/ms changes
  useState(timeout)
  return debounced
}

export function Search() {
  const [q, setQ] = useState('')
  const debouncedQ = useDebounce(q, 250)
  const { data: results = [], isLoading } = useSearch(debouncedQ)

  const [recent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('beadsui-recent-searches') ?? '[]') as string[]
    } catch {
      return []
    }
  })

  const handleSearch = (value: string) => {
    setQ(value)
    if (value.trim() && !recent.includes(value.trim())) {
      const next = [value.trim(), ...recent].slice(0, 5)
      localStorage.setItem('beadsui-recent-searches', JSON.stringify(next))
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Search</h1>

      <Input
        placeholder="Search issues by title, ID, or description…"
        value={q}
        onChange={(e) => handleSearch(e.target.value)}
        autoFocus
        className="text-base"
      />

      {/* Recent searches */}
      {!q && recent.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Recent</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button
                key={r}
                onClick={() => setQ(r)}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-violet-400 hover:text-violet-600 dark:border-slate-700 dark:text-slate-400"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {debouncedQ && (
        <>
          {isLoading ? (
            <PageSpinner />
          ) : results.length === 0 ? (
            <EmptyState icon="⌕" title={`No results for "${debouncedQ}"`} description="Try a different search term." />
          ) : (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                {results.map((issue) => (
                  <Link
                    key={issue.id}
                    to={`/issues/${issue.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="w-20 shrink-0 font-mono text-xs text-slate-400">{issue.id}</span>
                    <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {issue.title}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={issue.status} />
                      <TypeBadge type={issue.issue_type} />
                      <PriorityBadge priority={issue.priority} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
