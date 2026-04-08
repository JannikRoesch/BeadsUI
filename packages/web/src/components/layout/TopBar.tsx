import { Button } from '../ui/Button'

interface TopBarProps {
  onSearch?: () => void
  onCreateIssue?: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function TopBar({ onSearch, onCreateIssue, theme, onToggleTheme }: TopBarProps) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
      <button
        onClick={onSearch}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:text-slate-300"
      >
        <span>⌕</span>
        <span>Search issues…</span>
        <kbd className="ml-2 rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] dark:bg-slate-800">⌘K</kbd>
      </button>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </Button>
        <Button size="sm" onClick={onCreateIssue}>
          + New Issue
        </Button>
      </div>
    </header>
  )
}
