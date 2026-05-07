import * as authService from '../services/authService.js'

export async function session(req, res, next) {
  try {
    const result = await authService.establishSession(req.body ?? {})
    res.json(result)
  } catch (e) {
    next(e)
  }
}
