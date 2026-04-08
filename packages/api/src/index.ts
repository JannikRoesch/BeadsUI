import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({ origin: 'http://localhost:5173' }))

app.get('/', (c) => c.json({ name: 'BeadsUI API', version: '0.1.0' }))

const PORT = Number(process.env.PORT ?? 3001)

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`BeadsUI API running on http://localhost:${PORT}`)
})

export { app }
