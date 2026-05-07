import { query } from './db.js'

export async function upsertUser({ id, login }) {
  await query(
    `INSERT INTO users (id, login) VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET login = EXCLUDED.login`,
    [id, login],
  )
}

export async function findUserById(id) {
  const { rows } = await query('SELECT id, login FROM users WHERE id = $1', [id])
  return rows[0] ?? null
}
