import amqplib from 'amqplib'

export const EXCHANGE = 'community_fit.events'
export const WORKER_QUEUE = 'community_fit.worker'

let connection
let channel

export async function connectPublisher(url) {
  connection = await amqplib.connect(url)
  connection.on('error', (err) => {
    console.error('[amqp] connection error', err)
  })
  channel = await connection.createChannel()
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true })
  await channel.assertQueue(WORKER_QUEUE, { durable: true })
  await channel.bindQueue(WORKER_QUEUE, EXCHANGE, 'notification.#')
  await channel.bindQueue(WORKER_QUEUE, EXCHANGE, 'checkin.#')
  return channel
}

export function getChannel() {
  if (!channel) throw new Error('RabbitMQ channel not initialized')
  return channel
}

export async function closePublisher() {
  try {
    await channel?.close()
  } catch {
    /* ignore */
  }
  try {
    await connection?.close()
  } catch {
    /* ignore */
  }
}
