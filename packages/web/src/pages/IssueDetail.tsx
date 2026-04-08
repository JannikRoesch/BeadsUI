import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import {
  useIssue,
  useCloseIssue,
  useReopenIssue,
  useClaimIssue,
  useComments,
  useAddComment,
  useChildren,
} from '../api/hooks'
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
import { PageSpinner } from '../components/ui/Spinner'
import { formatDate, formatRelative } from '../lib/utils'

export function IssueDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [commentBody, setCommentBody] = useState('')

  const { data: issue, isLoading } = useIssue(id!)
  const { data: comments = [] } = useComments(id!)
  const { data: children = [] } = useChildren(id!)

  const closeIssue = useCloseIssue(id!)
  const reopenIssue = useReopenIssue(id!)
  const claimIssue = useClaimIssue(id!)
  const addComment = useAddComment(id!)

  if (isLoading) return <PageSpinner />
  if (!issue) return (
    <div className="text-center py-16 text-slate-400">Issue not found. <Link to="/issues" className="text-violet-600 hover:underline">Back to issues</Link></div>
  )

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim()) return
    await addComment.mutateAsync(commentBody)
    setCommentBody('')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400">
        <Link to="/issues" className="hover:text-violet-600">Issues</Link>
        <span className="mx-2">/</span>
        <span className="font-mono">{issue.id}</span>
      </nav>

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{issue.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-400">{issue.id}</span>
              <StatusBadge status={issue.status} />
              <TypeBadge type={issue.issue_type} />
              <PriorityBadge priority={issue.priority} />
              {issue.assignee && (
                <span className="text-xs text-slate-500">@ {issue.assignee}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {issue.status !== 'closed' ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={claimIssue.isPending}
                  onClick={() => claimIssue.mutate()}
                >
                  Claim
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={closeIssue.isPending}
                  onClick={() => closeIssue.mutate()}
                >
                  Close
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                loading={reopenIssue.isPending}
                onClick={() => reopenIssue.mutate()}
              >
                Reopen
              </Button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
          <div>
            <span className="text-slate-400">Created</span>
            <span className="ml-2 text-slate-700 dark:text-slate-300">{formatDate(issue.created_at)}</span>
          </div>
          <div>
            <span className="text-slate-400">Updated</span>
            <span className="ml-2 text-slate-700 dark:text-slate-300">{formatRelative(issue.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {issue.description && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Description</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{issue.description}</ReactMarkdown>
          </div>
        </section>
      )}

      {/* Design / Acceptance / Notes */}
      {[
        { label: 'Design', value: issue.design },
        { label: 'Acceptance Criteria', value: issue.acceptance },
        { label: 'Notes', value: issue.notes },
      ]
        .filter(({ value }) => !!value)
        .map(({ label, value }) => (
          <section key={label} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{label}</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{value!}</ReactMarkdown>
            </div>
          </section>
        ))}

      {/* Children */}
      {(children as typeof children).length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Sub-issues ({children.length})
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {children.map((child) => (
              <Link
                key={child.id}
                to={`/issues/${child.id}`}
                className="flex items-center gap-3 py-2 hover:text-violet-600"
              >
                <span className="font-mono text-xs text-slate-400">{child.id}</span>
                <span className="flex-1 text-sm">{child.title}</span>
                <StatusBadge status={child.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Comments */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Comments {(comments as unknown[]).length > 0 && `(${(comments as unknown[]).length})`}
        </h2>

        {(comments as Array<{ body: string; author?: string; created_at?: string }>).map((c, i) => (
          <div key={i} className="mb-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
              <span>{c.author ?? 'Unknown'}</span>
              <span>·</span>
              <span>{formatRelative(c.created_at)}</span>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{c.body}</ReactMarkdown>
            </div>
          </div>
        ))}

        <form onSubmit={handleComment} className="mt-3 space-y-2">
          <Textarea
            placeholder="Add a comment… (Markdown supported)"
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
          />
          <Button size="sm" type="submit" loading={addComment.isPending} disabled={!commentBody.trim()}>
            Comment
          </Button>
        </form>
      </section>
    </div>
  )
}
