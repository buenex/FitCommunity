import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { router } from './routes/index.js'
import { connectPublisher } from './messaging/amqp.js'
import { getPool } from './repositories/db.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '64kb' }))

app.use('/api', router)

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const code = err.statusCode
  const status =
    code && Number.isInteger(code) && code >= 400 && code < 600 ? code : 400
  const message = err?.message || 'Erro inesperado.'
  if (status >= 500) console.error(err)
  res.status(status).json({ error: message })
})

async function start() {
  getPool()
  const rabbitUrl = process.env.RABBITMQ_URL
  if (!rabbitUrl) throw new Error('RABBITMQ_URL is required')
  await connectPublisher(rabbitUrl)

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL is required')

  app.listen(port, () => {
    console.log(`[api] listening on :${port}`)
  })
}

start().catch((err) => {
  console.error('[api] failed to start', err)
  process.exit(1)
})
