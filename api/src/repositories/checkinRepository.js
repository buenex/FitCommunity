import { query } from './db.js'

export async function insertCheckin({ communityId, userId, dateKey }) {
  const { rows } = await query(
    `INSERT INTO checkins (community_id, user_id, checkin_date)
     VALUES ($1, $2, $3::date)
     ON CONFLICT (community_id, user_id, checkin_date) DO NOTHING
     RETURNING id, community_id AS "communityId", user_id AS "userId",
       to_char(checkin_date, 'YYYY-MM-DD') AS "dateKey", created_at AS "createdAt"`,
    [communityId, userId, dateKey],
  )
  return rows[0] ?? null
}

export async function listCheckinsForCommunity(communityId) {
  const { rows } = await query(
    `SELECT to_char(c.checkin_date, 'YYYY-MM-DD') AS "dateKey",
            u.id AS "userId", u.login
     FROM checkins c
     INNER JOIN users u ON u.id = c.user_id
     WHERE c.community_id = $1
     ORDER BY c.checkin_date ASC, u.login ASC`,
    [communityId],
  )
  return rows
}
