import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { bd } from '../lib/bd.js'
import type { Issue } from '../lib/types.js'

const events = new Hono()

// GET /events — SSE stream for real-time issue updates
// Polls beads every 3s and emits change events to connected clients
events.get('/', (c) => {
  return streamSSE(c, async (stream) => {
    let lastSnapshot = await snapshot()

    await stream.writeSSE({
      event: 'connected',
      data: JSON.stringify({ message: 'BeadsUI SSE connected' }),
    })

    while (!stream.closed) {
      await stream.sleep(3000)

      try {
        const current = await snapshot()
        const changes = diff(lastSnapshot, current)

        for (const change of changes) {
          await stream.writeSSE({
            event: change.event,
            data: JSON.stringify(change.data),
          })
        }

        lastSnapshot = current
      } catch {
        // bd may be temporarily unavailable; keep stream alive
      }
    }
  })
})

interface SnapshotMap {
  [id: string]: { status: string; updated_at?: string }
}

async function snapshot(): Promise<SnapshotMap> {
  try {
    const open = await bd<Issue[]>(['list', '--status=open'])
    const inProgress = await bd<Issue[]>(['list', '--status=in_progress'])
    const all = [...open, ...inProgress]
    const map: SnapshotMap = {}
    for (const issue of all) {
      map[issue.id] = { status: issue.status, ...(issue.updated_at && { updated_at: issue.updated_at }) }
    }
    return map
  } catch {
    return {}
  }
}

interface SseChange {
  event: 'issue_created' | 'issue_updated' | 'issue_closed'
  data: { id: string; status?: string }
}

function diff(prev: SnapshotMap, curr: SnapshotMap): SseChange[] {
  const changes: SseChange[] = []

  for (const [id, entry] of Object.entries(curr)) {
    if (!prev[id]) {
      changes.push({ event: 'issue_created', data: { id } })
    } else if (prev[id]?.updated_at !== entry.updated_at) {
      changes.push({ event: 'issue_updated', data: { id, status: entry.status } })
    }
  }

  for (const id of Object.keys(prev)) {
    if (!curr[id]) {
      changes.push({ event: 'issue_closed', data: { id } })
    }
  }

  return changes
}

export { events }
