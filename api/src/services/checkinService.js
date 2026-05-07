import * as memberRepository from '../repositories/memberRepository.js'
import * as checkinRepository from '../repositories/checkinRepository.js'
import { publishEvent } from './eventPublisher.js'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function checkIn({ communityId, userId, login, dateKey }) {
  const key = String(dateKey ?? '').trim()
  if (!DATE_RE.test(key)) throw new Error('Data inválida. Use YYYY-MM-DD.')

  const member = await memberRepository.isMember(communityId, userId)
  if (!member) {
    const err = new Error('Você não participa desta comunidade.')
    err.statusCode = 403
    throw err
  }

  const inserted = await checkinRepository.insertCheckin({
    communityId,
    userId,
    dateKey: key,
  })

  if (inserted) {
    const createdAt = new Date(inserted.createdAt).getTime()
    publishEvent('checkin.created', {
      type: 'checkin.created',
      checkinId: inserted.id,
      communityId,
      userId,
      login,
      dateKey: key,
      createdAt,
    })
  }

  return { ok: true, created: Boolean(inserted) }
}
