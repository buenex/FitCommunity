import jwt from 'jsonwebtoken'

export function signSession(user) {
  return jwt.sign(
    { userId: user.userId, login: user.login },
    process.env.JWT_SECRET,
    { expiresIn: '30d' },
  )
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}
