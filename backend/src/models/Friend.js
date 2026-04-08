const { query } = require('../config/db');

const Friend = {
  async findAll(userId) {
    const { rows } = await query(
      `SELECT
         u.id, u.name, u.email, u.profile_picture,
         f.status,
         f.created_at AS friend_since,
         COALESCE(MAX(s.current_streak), 0) AS top_streak,
         CASE WHEN f.user_id = $1 THEN 'sent' ELSE 'received' END AS direction
       FROM friends f
       JOIN users u ON (
         CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END = u.id
       )
       LEFT JOIN habits h  ON h.user_id = u.id AND h.archived = false
       LEFT JOIN streaks s ON s.habit_id = h.id
       WHERE f.user_id = $1 OR f.friend_id = $1
       GROUP BY u.id, u.name, u.email, u.profile_picture, f.status, f.created_at, f.user_id
       ORDER BY f.status, u.name`,
      [userId]
    );
    return rows;
  },

  async findRequest(userId, friendId) {
    const { rows } = await query(
      `SELECT * FROM friends
       WHERE (user_id = $1 AND friend_id = $2)
          OR (user_id = $2 AND friend_id = $1)`,
      [userId, friendId]
    );
    return rows[0] || null;
  },

  async sendRequest(userId, friendId) {
    const { rows } = await query(
      `INSERT INTO friends (user_id, friend_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [userId, friendId]
    );
    return rows[0] || null;
  },

  async accept(requesterId, accepterId) {
    const { rows } = await query(
      `UPDATE friends SET status = 'accepted'
       WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'
       RETURNING *`,
      [requesterId, accepterId]
    );
    return rows[0] || null;
  },

  async remove(userId, friendId) {
    const { rowCount } = await query(
      `DELETE FROM friends
       WHERE (user_id = $1 AND friend_id = $2)
          OR (user_id = $2 AND friend_id = $1)`,
      [userId, friendId]
    );
    return rowCount > 0;
  },
};

module.exports = Friend;
