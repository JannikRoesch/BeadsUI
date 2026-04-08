import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { api } from './client'

// ── Types (mirrors backend) ──────────────────────────────────────────────────

export interface Issue {
  id: string
  title: string
  description?: string
  status: 'open' | 'in_progress' | 'closed' | 'blocked'
  issue_type: 'bug' | 'feature' | 'task' | 'epic' | 'chore' | 'decision'
  priority: 0 | 1 | 2 | 3 | 4
  assignee?: string | null
  labels?: string[]
  design?: string | null
  acceptance?: string | null
  notes?: string | null
  created_at?: string
  updated_at?: string
  dependency_count?: number
  dependent_count?: number
}

export interface Memory {
  id?: string
  content: string
  created_at?: string
}

export interface Graph {
  nodes: Array<{ id: string; title: string; status: string; issue_type: string; priority: number }>
  edges: Array<{ source: string; target: string; dep_type: string }>
}

// ── Query keys ───────────────────────────────────────────────────────────────

export const keys = {
  issues: (filters?: Record<string, string>) => ['issues', filters ?? {}] as const,
  issue: (id: string) => ['issues', id] as const,
  ready: () => ['issues', 'ready'] as const,
  blocked: () => ['issues', 'blocked'] as const,
  stats: () => ['stats'] as const,
  search: (q: string) => ['search', q] as const,
  graph: () => ['graph'] as const,
  memories: (q?: string) => ['memories', q ?? ''] as const,
  config: () => ['config'] as const,
  epics: () => ['epics'] as const,
  stale: () => ['stale'] as const,
  comments: (id: string) => ['comments', id] as const,
  history: (id: string) => ['history', id] as const,
  children: (id: string) => ['children', id] as const,
}

// ── Issue hooks ───────────────────────────────────────────────────────────────

export function useIssues(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters ?? {}).toString()
  const path = `/issues${params ? `?${params}` : ''}`
  return useQuery({ queryKey: keys.issues(filters), queryFn: () => api.get<Issue[]>(path) })
}

export function useIssue(id: string, options?: Partial<UseQueryOptions<Issue>>) {
  return useQuery({
    queryKey: keys.issue(id),
    queryFn: () => api.get<Issue>(`/issues/${id}`),
    ...options,
  })
}

export function useReady() {
  return useQuery({ queryKey: keys.ready(), queryFn: () => api.get<Issue[]>('/issues/ready') })
}

export function useBlocked() {
  return useQuery({ queryKey: keys.blocked(), queryFn: () => api.get<Issue[]>('/issues/blocked') })
}

export function useStats() {
  return useQuery({ queryKey: keys.stats(), queryFn: () => api.get('/config/stats') })
}

export function useSearch(q: string) {
  return useQuery({
    queryKey: keys.search(q),
    queryFn: () => api.get<Issue[]>(`/issues/search?q=${encodeURIComponent(q)}`),
    enabled: q.length > 0,
  })
}

export function useGraph() {
  return useQuery({ queryKey: keys.graph(), queryFn: () => api.get<Graph>('/graph') })
}

export function useMemories(q?: string) {
  const path = q ? `/memories?q=${encodeURIComponent(q)}` : '/memories'
  return useQuery({ queryKey: keys.memories(q), queryFn: () => api.get(path) })
}

export function useConfig() {
  return useQuery({ queryKey: keys.config(), queryFn: () => api.get('/config') })
}

export function useEpics() {
  return useQuery({ queryKey: keys.epics(), queryFn: () => api.get<Issue[]>('/config/epics') })
}

export function useComments(issueId: string) {
  return useQuery({
    queryKey: keys.comments(issueId),
    queryFn: () => api.get(`/issues/${issueId}/comments`),
  })
}

export function useIssueHistory(issueId: string) {
  return useQuery({
    queryKey: keys.history(issueId),
    queryFn: () => api.get(`/issues/${issueId}/history`),
  })
}

export function useChildren(issueId: string) {
  return useQuery({
    queryKey: keys.children(issueId),
    queryFn: () => api.get<Issue[]>(`/issues/${issueId}/children`),
  })
}

// ── Mutation hooks ────────────────────────────────────────────────────────────

export function useCreateIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Issue> & { title: string }) => api.post('/issues', body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['issues'] })
      void qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useUpdateIssue(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Issue>) => api.patch(`/issues/${id}`, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.issue(id) })
      void qc.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}

export function useCloseIssue(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reason?: string) => api.post(`/issues/${id}/close`, { reason }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['issues'] })
      void qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useReopenIssue(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post(`/issues/${id}/reopen`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['issues'] }),
  })
}

export function useClaimIssue(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post(`/issues/${id}/claim`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['issues'] }),
  })
}

export function useAddComment(issueId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => api.post(`/issues/${issueId}/comments`, { body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.comments(issueId) }),
  })
}

export function useAddDep(issueId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { depends_on_id: string; dep_type?: string }) =>
      api.post(`/issues/${issueId}/deps`, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['issues'] }),
  })
}

export function useRemoveDep(issueId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (depId: string) => api.delete(`/issues/${issueId}/deps/${depId}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['issues'] }),
  })
}

export function useAddMemory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => api.post('/memories', { content }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['memories'] }),
  })
}

export function useForgetMemory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/memories/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['memories'] }),
  })
}
