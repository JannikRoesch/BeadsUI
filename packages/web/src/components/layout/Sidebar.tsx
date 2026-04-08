import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '⬡', end: true },
  { to: '/issues', label: 'Issues', icon: '◎' },
  { to: '/graph', label: 'Graph', icon: '⬡' },
  { to: '/epics', label: 'Epics', icon: '◉' },
  { to: '/memories', label: 'Memories', icon: '◈' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-56 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xl font-bold text-violet-600">◉</span>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">BeadsUI</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1">
        {NAV.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-violet-50 font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
              )
            }
          >
            <span className="w-4 text-center text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom kbd hint */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <p className="text-xs text-slate-400">
          <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] dark:bg-slate-800">⌘K</kbd>{' '}
          Search
        </p>
      </div>
    </aside>
  )
}
