import { Hono } from 'hono'
import { bd, bdRaw, BdError } from '../lib/bd.js'

const memories = new Hono()

// GET /memories?q=keyword
memories.get('/', async (c) => {
  const q = c.req.query('q')
  const args = q ? ['memories', q] : ['memories']
  try {
    const data = await bd(args)
    return c.json({ data })
  } catch (err) {
    if (err instanceof BdError) return c.json({ error: err.message }, 400)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// POST /memories  body: { content: string }
memories.post('/', async (c) => {
  const body = await c.req.json<{ content: string }>()
  try {
    await bdRaw(['remember', body.content])
    return c.json({ data: { ok: true } }, 201)
  } catch (err) {
    if (err instanceof BdError) return c.json({ error: err.message }, 400)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// DELETE /memories/:id
memories.delete('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    await bdRaw(['forget', id])
    return c.json({ data: { ok: true } })
  } catch (err) {
    if (err instanceof BdError) return c.json({ error: err.message }, 400)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export { memories }
