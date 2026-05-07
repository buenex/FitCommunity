import 'dotenv/config'
import pg from 'pg'
import amqplib from 'amqplib'
import { EXCHANGE, WORKER_QUEUE } from './messaging/topology.js'
import * as deliveryRepository from './repositories/deliveryRepository.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
})

async function ensureTopology(ch) {
  await ch.assertExchange(EXCHANGE, 'topic', { durable: true })
  await ch.assertQueue(WORKER_QUEUE, { durable: true })
  await ch.bindQueue(WORKER_QUEUE, EXCHANGE, 'notification.#')
  await ch.bindQueue(WORKER_QUEUE, EXCHANGE, 'checkin.#')
}

async function handleMessage(msg, ch) {
  if (!msg) return
  try {
    let payload
    try {
      payload = JSON.parse(msg.content.toString())
    } catch {
      ch.ack(msg)
      return
    }

    const routingKey = msg.fields.routingKey
    const eventType = payload?.type || routingKey || 'unknown'

    await deliveryRepository.insertDelivery(pool, {
      eventType,
      refId: payload?.notificationId || payload?.checkinId || null,
      communityId: payload?.communityId || null,
      payload,
    })

    ch.ack(msg)
  } catch (err) {
    console.error('[worker] delivery failed (message discarded)', err)
    ch.ack(msg)
  }
}

async function main() {
  const url = process.env.RABBITMQ_URL
  if (!url) throw new Error('RABBITMQ_URL is required')

  const conn = await amqplib.connect(url)
  conn.on('error', (err) => console.error('[worker] amqp error', err))

  const ch = await conn.createChannel()
  await ch.prefetch(20)
  await ensureTopology(ch)

  await ch.consume(WORKER_QUEUE, (msg) => {
    void handleMessage(msg, ch)
  })

  console.log('[worker] consuming queue', WORKER_QUEUE)
}

main().catch((err) => {
  console.error('[worker] fatal', err)
  process.exit(1)
})
