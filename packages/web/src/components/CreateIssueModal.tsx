import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateIssue } from '../api/hooks'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input, Select, Textarea } from './ui/Input'
import { useToast } from './ui/Toast'

const TYPE_OPTIONS = [
  { value: 'task', label: 'Task' },
  { value: 'feature', label: 'Feature' },
  { value: 'bug', label: 'Bug' },
  { value: 'epic', label: 'Epic' },
  { value: 'chore', label: 'Chore' },
  { value: 'decision', label: 'Decision' },
]

const PRIORITY_OPTIONS = [
  { value: 0, label: 'P0 Critical' },
  { value: 1, label: 'P1 High' },
  { value: 2, label: 'P2 Medium' },
  { value: 3, label: 'P3 Low' },
  { value: 4, label: 'P4 Backlog' },
]

interface CreateIssueModalProps {
  open: boolean
  onClose: () => void
}

export function CreateIssueModal({ open, onClose }: CreateIssueModalProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createIssue = useCreateIssue()

  const [form, setForm] = useState({
    title: '',
    description: '',
    issue_type: 'task',
    priority: 2,
    acceptance: '',
  })

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    try {
      const result = await createIssue.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        issue_type: form.issue_type as never,
        priority: form.priority as never,
        acceptance: form.acceptance || undefined,
      })
      const id = (result as { id?: string })?.id
      toast(`Created ${id ?? 'issue'}`, 'success')
      onClose()
      setForm({ title: '', description: '', issue_type: 'task', priority: 2, acceptance: '' })
      if (id) navigate(`/issues/${id}`)
    } catch (err) {
      toast(`Failed to create issue: ${String(err)}`, 'error')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Issue"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="create-issue-form" loading={createIssue.isPending}>
            Create
          </Button>
        </>
      }
    >
      <form id="create-issue-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title *"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
          autoFocus
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            options={TYPE_OPTIONS}
            value={form.issue_type}
            onChange={(e) => set('issue_type', e.target.value)}
          />
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(e) => set('priority', Number(e.target.value))}
          />
        </div>
        <Textarea
          label="Description"
          placeholder="Why this issue exists and what needs to be done…"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
        />
        <Textarea
          label="Acceptance Criteria"
          placeholder="Done when…"
          value={form.acceptance}
          onChange={(e) => set('acceptance', e.target.value)}
          rows={2}
        />
      </form>
    </Modal>
  )
}
