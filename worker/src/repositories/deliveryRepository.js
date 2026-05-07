export async function insertDelivery(pool, { eventType, refId, communityId, payload }) {
  await pool.query(
    `INSERT INTO message_deliveries (event_type, ref_id, community_id, payload, status)
     VALUES ($1, $2, $3, $4::jsonb, 'processed')`,
    [eventType, refId, communityId, JSON.stringify(payload ?? {})],
  )
}
