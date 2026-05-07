import { getChannel, EXCHANGE } from '../messaging/amqp.js'

export function publishEvent(routingKey, payload) {
  const ch = getChannel()
  ch.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
    contentType: 'application/json',
  })
}
