import { query } from './db.js'

export async function insertNotification({ communityId, authorId, message }) {
  const { rows } = await query(
    `INSERT INTO notifications (community_id, author_id, message)
     VALUES ($1, $2, $3)
     RETURNING id, message, created_at AS "createdAt"`,
    [communityId, authorId, message],
  )
  return rows[0]
}

export async function listNotifications(communityId, limit = 50) {
  const { rows } = await query(
    `SELECT n.id, n.message, n.created_at AS "createdAt", u.login AS "authorLogin"
     FROM notifications n
     INNER JOIN users u ON u.id = n.author_id
     WHERE n.community_id = $1
     ORDER BY n.created_at DESC
     LIMIT $2`,
    [communityId, limit],
  )
  return rows.map((r) => ({
    ...r,
    createdAt: new Date(r.createdAt).getTime(),
  }))
}
