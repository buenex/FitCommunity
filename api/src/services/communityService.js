import crypto from 'crypto'
import * as communityRepository from '../repositories/communityRepository.js'
import * as memberRepository from '../repositories/memberRepository.js'
import * as checkinRepository from '../repositories/checkinRepository.js'
import * as notificationRepository from '../repositories/notificationRepository.js'
import { randomInviteCode, isUuid } from '../utils/cryptoIds.js'

function groupCheckinsByDate(rows) {
  const checkinsByDate = {}
  for (const row of rows) {
    if (!checkinsByDate[row.dateKey]) checkinsByDate[row.dateKey] = []
    checkinsByDate[row.dateKey].push({ userId: row.userId, login: row.login })
  }
  return checkinsByDate
}

export async function listMine(userId) {
  return communityRepository.listByUserId(userId)
}

export async function createCommunity({ name, creatorUserId, creatorLogin }) {
  const trimmed = String(name ?? '').trim()
  if (!trimmed) throw new Error('Dê um nome à comunidade.')

  let inviteCode = ''
  let row = null
  for (let attempt = 0; attempt < 12; attempt++) {
    inviteCode = randomInviteCode()
    const id = crypto.randomUUID()
    try {
      row = await communityRepository.insertCommunity({
        id,
        name: trimmed,
        inviteCode,
      })
      break
    } catch (e) {
      if (e?.code === '23505') continue
      throw e
    }
  }
  if (!row) throw new Error('Não foi possível gerar código de convite único.')

  await memberRepository.addMember(row.id, creatorUserId)
  return getCommunityFull(row.id, creatorUserId)
}

export async function joinByInviteCode({ inviteCode, userId }) {
  const code = String(inviteCode ?? '').trim().toUpperCase()
  if (!code) throw new Error('Informe o código.')

  const community = await communityRepository.findByInviteCode(code)
  if (!community) return null

  await memberRepository.addMember(community.id, userId)
  return getCommunityFull(community.id, userId)
}

export async function setStreakDaysTarget({ communityId, userId, streakDaysTarget }) {
  if (!isUuid(communityId)) {
    const err = new Error('Id de comunidade inválido.')
    err.statusCode = 400
    throw err
  }
  const n = Number(streakDaysTarget)
  if (!Number.isInteger(n) || n < 2 || n > 6) {
    throw new Error('A meta da sequência semanal deve ser um número inteiro entre 2 e 6 dias.')
  }

  const member = await memberRepository.isMember(communityId, userId)
  if (!member) {
    const err = new Error('Você não participa desta comunidade.')
    err.statusCode = 403
    throw err
  }

  const updated = await communityRepository.updateStreakDaysTarget(communityId, n)
  if (!updated) return null

  return getCommunityFull(communityId, userId)
}

export async function getCommunityFull(communityId, requesterUserId) {
  if (!isUuid(communityId)) return null

  const base = await communityRepository.findById(communityId)
  if (!base) return null

  const member = await memberRepository.isMember(communityId, requesterUserId)
  if (!member) {
    const err = new Error('Você não participa desta comunidade.')
    err.statusCode = 403
    throw err
  }

  const [members, checkinRows, notifications] = await Promise.all([
    memberRepository.listMembers(communityId),
    checkinRepository.listCheckinsForCommunity(communityId),
    notificationRepository.listNotifications(communityId, 50),
  ])

  const streakRaw = Number(base.streakDaysTarget)
  const streakDaysTarget =
    Number.isFinite(streakRaw) && streakRaw >= 2 && streakRaw <= 6 ? streakRaw : 4

  return {
    id: base.id,
    name: base.name,
    inviteCode: base.inviteCode,
    streakDaysTarget,
    members,
    checkinsByDate: groupCheckinsByDate(checkinRows),
    notifications,
  }
}
