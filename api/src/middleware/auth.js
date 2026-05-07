import { verifyToken } from '../utils/jwt.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Não autorizado.' })
    return
  }
  try {
    const payload = verifyToken(header.slice(7))
    req.user = { userId: payload.userId, login: payload.login }
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}
