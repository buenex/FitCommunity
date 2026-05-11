import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import * as communityController from '../controllers/communityController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ ok: true })
})

router.post('/auth/session', authController.session)

router.get('/communities/mine', requireAuth, communityController.listMine)
router.post('/communities', requireAuth, communityController.create)
router.post('/communities/join', requireAuth, communityController.join)
router.get('/communities/:id', requireAuth, communityController.getOne)
router.patch('/communities/:id', requireAuth, communityController.patchOne)
router.post('/communities/:id/checkins', requireAuth, communityController.checkin)
router.post('/communities/:id/notifications', requireAuth, communityController.addNotification)

export { router }
