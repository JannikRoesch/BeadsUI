export type IssueStatus = 'open' | 'in_progress' | 'closed' | 'blocked'
export type IssueType = 'bug' | 'feature' | 'task' | 'epic' | 'chore' | 'decision'
export type Priority = 0 | 1 | 2 | 3 | 4
export type DepType = 'blocks' | 'related' | 'parent-child' | 'discovered-from'

export interface Issue {
  id: string
  title: string
  description?: string
  status: IssueStatus
  issue_type: IssueType
  priority: Priority
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

export interface Dependency {
  issue_id: string
  depends_on_id: string
  dep_type: DepType
}

export interface Comment {
  id?: string
  issue_id: string
  author?: string
  body: string
  created_at?: string
}

export interface Memory {
  id?: string
  content: string
  created_at?: string
  tags?: string[]
}

export interface Stats {
  total: number
  open: number
  closed: number
  in_progress: number
  blocked: number
  [key: string]: number
}

export interface GraphNode {
  id: string
  title: string
  status: IssueStatus
  issue_type: IssueType
  priority: Priority
}

export interface GraphEdge {
  source: string
  target: string
  dep_type: DepType
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface ApiResponse<T> {
  data: T
  error?: never
}

export interface ApiError {
  data?: never
  error: string
  code?: number
}

export type ApiResult<T> = ApiResponse<T> | ApiError
