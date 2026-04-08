import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useNavigate } from 'react-router-dom'
import { useGraph } from '../api/hooks'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'

const STATUS_COLORS: Record<string, string> = {
  open: '#10b981',
  in_progress: '#3b82f6',
  closed: '#94a3b8',
  blocked: '#ef4444',
}

export function GraphView() {
  const { data: graph, isLoading } = useGraph()
  const navigate = useNavigate()

  if (isLoading) return <PageSpinner />

  const nodes: Node[] =
    graph?.nodes.map((n) => ({
      id: n.id,
      data: { label: `${n.id}\n${n.title}` },
      position: { x: 0, y: 0 },
      style: {
        background: STATUS_COLORS[n.status] ?? '#94a3b8',
        color: 'white',
        borderRadius: 8,
        fontSize: 11,
        padding: '6px 10px',
        border: 'none',
        maxWidth: 180,
        whiteSpace: 'pre-line' as const,
      },
    })) ?? []

  const edges: Edge[] =
    graph?.edges.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      label: e.dep_type,
      style: { stroke: '#6366f1' },
      labelStyle: { fontSize: 10 },
    })) ?? []

  if (nodes.length === 0) {
    return <EmptyState icon="⬡" title="No graph data" description="Add dependencies between issues to see a graph." />
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Dependency Graph</h1>
      <div className="h-[calc(100vh-12rem)] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodeClick={(_, node) => navigate(`/issues/${node.id}`)}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: color }} />
            <span className="text-slate-500 capitalize">{status.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
