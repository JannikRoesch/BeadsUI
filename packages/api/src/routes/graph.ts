import { Hono } from 'hono'
import { bd, BdError } from '../lib/bd.js'
import type { Graph, Issue } from '../lib/types.js'

const graph = new Hono()

// GET /graph — full dependency graph as nodes + edges
graph.get('/', async (c) => {
  try {
    // Fetch all issues and their deps to build graph
    const issues = await bd<Issue[]>(['list', '--status=open'])
    const closed = await bd<Issue[]>(['list', '--status=closed'])
    const inProgress = await bd<Issue[]>(['list', '--status=in_progress'])
    const allIssues = [...issues, ...closed, ...inProgress]

    const nodes = allIssues.map((i) => ({
      id: i.id,
      title: i.title,
      status: i.status,
      issue_type: i.issue_type,
      priority: i.priority,
    }))

    // Try to get graph data from bd graph command
    let edges: Graph['edges'] = []
    try {
      const rawGraph = await bd<{ edges?: Array<{ from: string; to: string; type: string }> }>(['graph', '--format=json'])
      if (rawGraph && typeof rawGraph === 'object' && 'edges' in rawGraph && Array.isArray(rawGraph.edges)) {
        edges = rawGraph.edges.map((e) => ({
          source: e.from,
          target: e.to,
          dep_type: e.type as Graph['edges'][number]['dep_type'],
        }))
      }
    } catch {
      // bd graph may not support --format=json; edges stay empty
    }

    return c.json({ data: { nodes, edges } satisfies Graph })
  } catch (err) {
    if (err instanceof BdError) {
      return c.json({ error: err.message }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export { graph }
