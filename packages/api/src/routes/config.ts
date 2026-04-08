import { Hono } from 'hono'
import { bd, bdRaw, BdError } from '../lib/bd.js'

const config = new Hono()

// GET /config
config.get('/', async (c) => {
  try {
    const data = await bd(['config', 'list'])
    return c.json({ data })
  } catch (err) {
    if (err instanceof BdError) return c.json({ error: err.message }, 400)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /config/doctor
config.get('/doctor', async (c) => {
  try {
    const raw = await bdRaw(['doctor'])
    return c.json({ data: { output: raw } })
  } catch (err) {
    if (err instanceof BdError) return c.json({ error: err.message }, 400)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /config/stats
config.get('/stats', async (c) => {
  try {
    const data = await bd(['stats'])
    return c.json({ data })
  } catch (err) {
    if (err instanceof BdError) return c.json({ error: err.message }, 400)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /config/stale
config.get('/stale', async (c) => {
  try {
    const data = await bd(['stale'])
    return c.json({ data })
  } catch (err) {
    if (err instanceof BdError) return c.json({ error: err.message }, 400)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /config/epics
config.get('/epics', async (c) => {
  try {
    const data = await bd(['epic', 'list'])
    return c.json({ data })
  } catch (err) {
    if (err instanceof BdError) return c.json({ error: err.message }, 400)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export { config }
