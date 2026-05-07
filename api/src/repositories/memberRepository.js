import { query } from './db.js'

export async function addMember(communityId, userId) {
  await query(
    `INSERT INTO community_members (community_id, user_id) VALUES ($1, $2)
     ON CONFLICT (community_id, user_id) DO NOTHING`,
    [communityId, userId],
  )
}

export async function isMember(communityId, userId) {
  const { rows } = await query(
    `SELECT 1 FROM community_members WHERE community_id = $1 AND user_id = $2`,
    [communityId, userId],
  )
  return rows.length > 0
}

export async function listMembers(communityId) {
  const { rows } = await query(
    `SELECT u.id AS "userId", u.login
     FROM community_members m
     INNER JOIN users u ON u.id = m.user_id
     WHERE m.community_id = $1
     ORDER BY u.login ASC`,
    [communityId],
  )
  return rows
}
