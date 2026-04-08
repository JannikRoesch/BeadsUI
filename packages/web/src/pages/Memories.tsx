import { useState } from 'react'
import { useMemories, useAddMemory, useForgetMemory } from '../api/hooks'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'

export function Memories() {
  const [q, setQ] = useState('')
  const [newMemory, setNewMemory] = useState('')
  const { data: memories, isLoading } = useMemories(q || undefined)
  const addMemory = useAddMemory()
  const forgetMemory = useForgetMemory()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemory.trim()) return
    await addMemory.mutateAsync(newMemory.trim())
    setNewMemory('')
  }

  const list = memories as Array<{ id?: string; content: string; created_at?: string }> | undefined

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Memories</h1>
      <p className="text-sm text-slate-400">
        Persistent knowledge stored across sessions via <code className="font-mono text-xs">bd remember</code>.
      </p>

      {/* Add memory */}
      <form onSubmit={handleAdd} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Textarea
          label="Add memory"
          placeholder="Something worth remembering across sessions…"
          value={newMemory}
          onChange={(e) => setNewMemory(e.target.value)}
          rows={2}
        />
        <Button size="sm" type="submit" loading={addMemory.isPending} disabled={!newMemory.trim()}>
          Remember
        </Button>
      </form>

      {/* Search */}
      <Input
        placeholder="Search memories…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {/* List */}
      {isLoading ? (
        <PageSpinner />
      ) : !list || list.length === 0 ? (
        <EmptyState icon="◈" title="No memories yet" description="Use bd remember or add one above." />
      ) : (
        <div className="space-y-2">
          {list.map((m, i) => (
            <div
              key={m.id ?? i}
              className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="flex-1 text-sm text-slate-700 dark:text-slate-300">{m.content}</p>
              {m.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => forgetMemory.mutate(m.id!)}
                  className="shrink-0 text-red-500 hover:text-red-600"
                >
                  Forget
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
