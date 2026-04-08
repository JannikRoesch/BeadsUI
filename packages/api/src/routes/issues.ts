import { Hono } from 'hono'
import { bd, bdOne, BdError } from '../lib/bd.js'
import type { Issue } from '../lib/types.js'

const issues = new Hono()

// GET /issues?status=open&type=task&priority=1&label=foo&assignee=bar
issues.get('/', async (c) => {
  const { status, type, priority, label, assignee, q } = c.req.query()
  const args = ['list']
  if (status) args.push(`--status=${status}`)
  if (type) args.push(`--type=${type}`)
  if (priority) args.push(`--priority=${priority}`)
  if (label) args.push(`--label=${label}`)
  if (assignee) args.push(`--assignee=${assignee}`)

  try {
    const data = await bd<Issue[]>(args)
    // If search query, filter client-side (bd list doesn't support --query + --json well)
    const filtered = q
      ? data.filter(
          (i) =>
            i.title.toLowerCase().includes(q.toLowerCase()) ||
            i.id.toLowerCase().includes(q.toLowerCase()),
        )
      : data
    return c.json({ data: filtered })
  } catch (err) {
    return handleError(c, err)
  }
})

// GET /issues/ready
issues.get('/ready', async (c) => {
  try {
    const data = await bd<Issue[]>(['ready'])
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// GET /issues/blocked
issues.get('/blocked', async (c) => {
  try {
    const data = await bd<Issue[]>(['blocked'])
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// GET /issues/stats
issues.get('/stats', async (c) => {
  try {
    const data = await bd(['status'])
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// GET /issues/search?q=query
issues.get('/search', async (c) => {
  const q = c.req.query('q') ?? ''
  if (!q) return c.json({ data: [] })
  try {
    const data = await bd<Issue[]>(['search', q])
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// GET /issues/:id
issues.get('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const data = await bdOne<Issue>(['show', id])
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// POST /issues  body: { title, description?, type?, priority?, labels?, assignee?, acceptance?, design? }
issues.post('/', async (c) => {
  const body = await c.req.json<{
    title: string
    description?: string
    type?: string
    priority?: number
    labels?: string[]
    assignee?: string
    acceptance?: string
    design?: string
  }>()

  const args = ['create', `--title=${body.title}`]
  if (body.description) args.push(`--description=${body.description}`)
  if (body.type) args.push(`--type=${body.type}`)
  if (body.priority !== undefined) args.push(`--priority=${body.priority}`)
  if (body.assignee) args.push(`--assignee=${body.assignee}`)
  if (body.acceptance) args.push(`--acceptance=${body.acceptance}`)
  if (body.design) args.push(`--design=${body.design}`)
  if (body.labels?.length) {
    for (const label of body.labels) args.push(`--label=${label}`)
  }

  try {
    const data = await bd(args)
    return c.json({ data }, 201)
  } catch (err) {
    return handleError(c, err)
  }
})

// PATCH /issues/:id  body: { title?, description?, priority?, assignee?, notes?, design?, acceptance? }
issues.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{
    title?: string
    description?: string
    priority?: number
    assignee?: string
    notes?: string
    design?: string
    acceptance?: string
  }>()

  const args = ['update', id]
  if (body.title) args.push(`--title=${body.title}`)
  if (body.description) args.push(`--description=${body.description}`)
  if (body.priority !== undefined) args.push(`--priority=${body.priority}`)
  if (body.assignee) args.push(`--assignee=${body.assignee}`)
  if (body.notes) args.push(`--notes=${body.notes}`)
  if (body.design) args.push(`--design=${body.design}`)
  if (body.acceptance) args.push(`--acceptance=${body.acceptance}`)

  try {
    const data = await bd(args)
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// POST /issues/:id/close
issues.post('/:id/close', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ reason?: string }>().catch(() => ({ reason: undefined }))
  const args = ['close', id]
  if (body.reason) args.push(`--reason=${body.reason}`)
  try {
    const data = await bd(args)
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// POST /issues/:id/reopen
issues.post('/:id/reopen', async (c) => {
  const id = c.req.param('id')
  try {
    const data = await bd(['reopen', id])
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// POST /issues/:id/claim
issues.post('/:id/claim', async (c) => {
  const id = c.req.param('id')
  try {
    const data = await bd(['update', id, '--claim'])
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// DELETE /issues/:id
issues.delete('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const data = await bd(['delete', id, '--force'])
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// GET /issues/:id/deps
issues.get('/:id/deps', async (c) => {
  const id = c.req.param('id')
  try {
    const data = await bd(['dep', 'list', id])
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// POST /issues/:id/deps  body: { depends_on_id, dep_type? }
issues.post('/:id/deps', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ depends_on_id: string; dep_type?: string }>()
  const args = ['dep', 'add', id, body.depends_on_id]
  if (body.dep_type) args.push(`--type=${body.dep_type}`)
  try {
    const data = await bd(args)
    return c.json({ data }, 201)
  } catch (err) {
    return handleError(c, err)
  }
})

// DELETE /issues/:id/deps/:depId
issues.delete('/:id/deps/:depId', async (c) => {
  const id = c.req.param('id')
  const depId = c.req.param('depId')
  try {
    const data = await bd(['dep', 'remove', id, depId])
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// GET /issues/:id/comments
issues.get('/:id/comments', async (c) => {
  const id = c.req.param('id')
  try {
    const data = await bd(['comments', id])
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// POST /issues/:id/comments  body: { body: string }
issues.post('/:id/comments', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ body: string }>()
  try {
    const data = await bd(['comment', id, body.body])
    return c.json({ data }, 201)
  } catch (err) {
    return handleError(c, err)
  }
})

// POST /issues/:id/notes  body: { body: string }
issues.post('/:id/notes', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ body: string }>()
  try {
    const data = await bd(['note', id, body.body])
    return c.json({ data }, 201)
  } catch (err) {
    return handleError(c, err)
  }
})

// GET /issues/:id/history
issues.get('/:id/history', async (c) => {
  const id = c.req.param('id')
  try {
    const data = await bd(['history', id])
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

// GET /issues/:id/children
issues.get('/:id/children', async (c) => {
  const id = c.req.param('id')
  try {
    const data = await bd<Issue[]>(['children', id])
    return c.json({ data })
  } catch (err) {
    return handleError(c, err)
  }
})

function handleError(c: { json: (body: unknown, status?: number) => Response }, err: unknown): Response {
  if (err instanceof BdError) {
    const status = err.stderr.includes('not found') ? 404 : 400
    return c.json({ error: err.message }, status)
  }
  return c.json({ error: 'Internal server error' }, 500)
}

export { issues }
