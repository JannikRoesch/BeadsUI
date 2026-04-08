import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { useSearch } from '../api/hooks'
import { StatusBadge, TypeBadge } from './ui/Badge'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onCreateIssue?: () => void
}

export function CommandPalette({ open, onClose, onCreateIssue }: CommandPaletteProps) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const { data: results = [] } = useSearch(q)

  // Close on Escape
  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  const go = (path: string) => {
    navigate(path)
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <Command shouldFilter={false}>
          <div className="border-b border-slate-200 dark:border-slate-700">
            <Command.Input
              value={q}
              onValueChange={setQ}
              placeholder="Search issues or navigate…"
              className="w-full bg-transparent px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
              autoFocus
            />
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2">
            {/* Navigation commands */}
            {!q && (
              <Command.Group heading={<span className="px-2 pb-1 text-xs font-medium text-slate-400">Navigation</span>}>
                {[
                  { label: 'Dashboard', shortcut: 'G D', path: '/' },
                  { label: 'Issues', shortcut: 'G I', path: '/issues' },
                  { label: 'Graph', shortcut: 'G G', path: '/graph' },
                  { label: 'Epics', shortcut: 'G E', path: '/epics' },
                  { label: 'Memories', shortcut: 'G M', path: '/memories' },
                  { label: 'Settings', shortcut: '', path: '/settings' },
                ].map(({ label, shortcut, path }) => (
                  <Command.Item
                    key={path}
                    value={label}
                    onSelect={() => go(path)}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 aria-selected:bg-violet-50 aria-selected:text-violet-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:aria-selected:bg-violet-950/40 dark:aria-selected:text-violet-400"
                  >
                    <span>{label}</span>
                    {shortcut && <kbd className="font-mono text-xs text-slate-400">{shortcut}</kbd>}
                  </Command.Item>
                ))}
                <Command.Item
                  value="create new issue"
                  onSelect={() => { onCreateIssue?.(); onClose() }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 aria-selected:bg-violet-50 aria-selected:text-violet-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:aria-selected:bg-violet-950/40 dark:aria-selected:text-violet-400"
                >
                  <span>+ Create new issue</span>
                  <kbd className="ml-auto font-mono text-xs text-slate-400">C</kbd>
                </Command.Item>
              </Command.Group>
            )}

            {/* Search results */}
            {q && results.length > 0 && (
              <Command.Group heading={<span className="px-2 pb-1 text-xs font-medium text-slate-400">Issues</span>}>
                {results.slice(0, 8).map((issue) => (
                  <Command.Item
                    key={issue.id}
                    value={issue.id}
                    onSelect={() => go(`/issues/${issue.id}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 aria-selected:bg-violet-50 dark:hover:bg-slate-800 dark:aria-selected:bg-violet-950/40"
                  >
                    <span className="w-20 shrink-0 font-mono text-xs text-slate-400">{issue.id}</span>
                    <span className="flex-1 text-slate-800 dark:text-slate-200">{issue.title}</span>
                    <StatusBadge status={issue.status} />
                    <TypeBadge type={issue.issue_type} />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {q && results.length === 0 && (
              <Command.Empty className="py-6 text-center text-sm text-slate-400">
                No results for "{q}"
              </Command.Empty>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
