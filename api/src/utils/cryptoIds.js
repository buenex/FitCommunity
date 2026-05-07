import crypto from 'crypto'

const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function randomInviteCode() {
  let s = ''
  for (let i = 0; i < 6; i++) {
    s += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)]
  }
  return s
}

export function userIdFromCredentials(login, password) {
  const normalized = `${login.trim().toLowerCase()}|${password}`
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex').slice(0, 20)
}

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value),
  )
}
