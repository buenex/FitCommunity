import * as communityService from '../services/communityService.js'
import * as checkinService from '../services/checkinService.js'
import * as notificationService from '../services/notificationService.js'
import { isUuid } from '../utils/cryptoIds.js'

export async function listMine(req, res, next) {
  try {
    const list = await communityService.listMine(req.user.userId)
    res.json(list)
  } catch (e) {
    next(e)
  }
}

export async function create(req, res, next) {
  try {
    const community = await communityService.createCommunity({
      name: req.body?.name,
      creatorUserId: req.user.userId,
      creatorLogin: req.user.login,
    })
    res.status(201).json(community)
  } catch (e) {
    next(e)
  }
}

export async function join(req, res, next) {
  try {
    const community = await communityService.joinByInviteCode({
      inviteCode: req.body?.inviteCode,
      userId: req.user.userId,
    })
    if (!community) {
      res.status(404).json({ error: 'Código não encontrado.' })
      return
    }
    res.json(community)
  } catch (e) {
    next(e)
  }
}

export async function getOne(req, res, next) {
  try {
    const { id } = req.params
    if (!isUuid(id)) {
      res.status(400).json({ error: 'Id de comunidade inválido.' })
      return
    }
    const community = await communityService.getCommunityFull(id, req.user.userId)
    if (!community) {
      res.status(404).json({ error: 'Comunidade não encontrada.' })
      return
    }
    res.json(community)
  } catch (e) {
    next(e)
  }
}

export async function patchOne(req, res, next) {
  try {
    const { id } = req.params
    if (!isUuid(id)) {
      res.status(400).json({ error: 'Id de comunidade inválido.' })
      return
    }
    const body = req.body ?? {}
    if (body.streakDaysTarget === undefined) {
      res.status(400).json({ error: 'Envie streakDaysTarget (2 a 6).' })
      return
    }
    const community = await communityService.setStreakDaysTarget({
      communityId: id,
      userId: req.user.userId,
      streakDaysTarget: body.streakDaysTarget,
    })
    if (!community) {
      res.status(404).json({ error: 'Comunidade não encontrada.' })
      return
    }
    res.json(community)
  } catch (e) {
    next(e)
  }
}

export async function checkin(req, res, next) {
  try {
    const { id } = req.params
    if (!isUuid(id)) {
      res.status(400).json({ error: 'Id de comunidade inválido.' })
      return
    }
    const result = await checkinService.checkIn({
      communityId: id,
      userId: req.user.userId,
      login: req.user.login,
      dateKey: req.body?.date,
    })
    const community = await communityService.getCommunityFull(id, req.user.userId)
    res.json({ result, community })
  } catch (e) {
    next(e)
  }
}

export async function addNotification(req, res, next) {
  try {
    const { id } = req.params
    if (!isUuid(id)) {
      res.status(400).json({ error: 'Id de comunidade inválido.' })
      return
    }
    const notification = await notificationService.createNotification({
      communityId: id,
      authorId: req.user.userId,
      authorLogin: req.user.login,
      message: req.body?.message,
    })
    const community = await communityService.getCommunityFull(id, req.user.userId)
    res.status(201).json({ notification, community })
  } catch (e) {
    next(e)
  }
}
