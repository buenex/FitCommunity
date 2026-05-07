import * as memberRepository from '../repositories/memberRepository.js'
import * as notificationRepository from '../repositories/notificationRepository.js'
import { publishEvent } from './eventPublisher.js'

export async function createNotification({ communityId, authorId, authorLogin, message }) {
  const text = String(message ?? '').trim()
  if (!text) throw new Error('Escreva uma mensagem.')

  const member = await memberRepository.isMember(communityId, authorId)
  if (!member) {
    const err = new Error('Você não participa desta comunidade.')
    err.statusCode = 403
    throw err
  }

  const row = await notificationRepository.insertNotification({
    communityId,
    authorId,
    message: text,
  })

  const createdAt = new Date(row.createdAt).getTime()

  publishEvent('notification.created', {
    type: 'notification.created',
    notificationId: row.id,
    communityId,
    authorId,
    authorLogin,
    message: row.message,
    createdAt,
  })

  return {
    id: row.id,
    message: row.message,
    createdAt,
    authorLogin,
  }
}
