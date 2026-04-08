import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { issues } from './routes/issues.js'
import { graph } from './routes/graph.js'
import { memories } from './routes/memories.js'
import { config } from './routes/config.js'
import { events } from './routes/events.js'

const app = new Hono()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)

app.get('/', (c) =>
  c.json({
    name: 'BeadsUI API',
    version: '0.1.0',
    workspace: process.env['BEADS_WORKSPACE'] ?? process.cwd(),
  }),
)

app.route('/issues', issues)
app.route('/graph', graph)
app.route('/memories', memories)
app.route('/config', config)
app.route('/events', events)

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404))

const PORT = Number(process.env['PORT'] ?? 3001)

serve({ fetch: app.fetch, port: PORT }, () => {
  const workspace = process.env['BEADS_WORKSPACE'] ?? process.cwd()
  console.log(`BeadsUI API running on http://localhost:${PORT}`)
  console.log(`Beads workspace: ${workspace}`)
})

export { app }
