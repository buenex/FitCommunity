import * as userRepository from '../repositories/userRepository.js'
import { userIdFromCredentials } from '../utils/cryptoIds.js'
import { signSession } from '../utils/jwt.js'

export async function establishSession({ login, password }) {
  const l = String(login ?? '').trim()
  if (!l) throw new Error('Informe um login.')
  if (!password) throw new Error('Informe uma senha.')

  const userId = userIdFromCredentials(l, password)
  await userRepository.upsertUser({ id: userId, login: l })

  const user = { userId, login: l }
  const token = signSession(user)
  return { user, token }
}
