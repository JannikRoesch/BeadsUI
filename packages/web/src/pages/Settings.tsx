import { useConfig } from '../api/hooks'
import { PageSpinner } from '../components/ui/Spinner'

export function Settings() {
  const { data: config, isLoading } = useConfig()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Settings</h1>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Beads Configuration</h2>
            <p className="mt-0.5 text-xs text-slate-400">Read from .beads/config.yaml</p>
          </div>
          <pre className="overflow-x-auto p-6 text-xs text-slate-600 dark:text-slate-400">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
