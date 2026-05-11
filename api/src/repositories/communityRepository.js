import { query } from './db.js'

export async function insertCommunity({ id, name, inviteCode }) {
  const { rows } = await query(
    `INSERT INTO communities (id, name, invite_code) VALUES ($1, $2, $3)
     RETURNING id, name, invite_code AS "inviteCode",
       streak_days_target AS "streakDaysTarget", created_at AS "createdAt"`,
    [id, name, inviteCode],
  )
  return rows[0]
}

export async function findByInviteCode(inviteCode) {
  const { rows } = await query(
    `SELECT id, name, invite_code AS "inviteCode",
            streak_days_target AS "streakDaysTarget", created_at AS "createdAt"
     FROM communities WHERE invite_code = $1`,
    [inviteCode],
  )
  return rows[0] ?? null
}

export async function findById(id) {
  const { rows } = await query(
    `SELECT id, name, invite_code AS "inviteCode",
            streak_days_target AS "streakDaysTarget", created_at AS "createdAt"
     FROM communities WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

export async function updateStreakDaysTarget(communityId, streakDaysTarget) {
  const { rows } = await query(
    `UPDATE communities SET streak_days_target = $2 WHERE id = $1
     RETURNING id, name, invite_code AS "inviteCode",
       streak_days_target AS "streakDaysTarget", created_at AS "createdAt"`,
    [communityId, streakDaysTarget],
  )
  return rows[0] ?? null
}

export async function listByUserId(userId) {
  const { rows } = await query(
    `SELECT c.id, c.name, c.invite_code AS "inviteCode", c.created_at AS "createdAt"
     FROM communities c
     INNER JOIN community_members m ON m.community_id = c.id
     WHERE m.user_id = $1
     ORDER BY c.name ASC`,
    [userId],
  )
  return rows
}
