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

  // Verify two users are actually friends (accepted) before allowing profile view
  async areFriends(userAId, userBId) {
    const { rows } = await query(
      `SELECT 1 FROM friends
       WHERE status = 'accepted'
         AND ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))`,
      [userAId, userBId]
    );
    return rows.length > 0;
  },

  // Get a friend's public profile + habits + streaks
  async getFriendProfile(friendId) {
    const { rows: userRows } = await query(
      `SELECT id, name, email, profile_picture, created_at FROM users WHERE id = $1`,
      [friendId]
    );
    if (!userRows[0]) return null;

    const { rows: habits } = await query(
      `SELECT
         h.id, h.name, h.icon, h.color, h.category, h.type, h.difficulty,
         h.target_days, h.why_reason,
         s.current_streak, s.best_streak,
         EXISTS(
           SELECT 1 FROM habit_logs l
           WHERE l.habit_id = h.id AND l.date = CURRENT_DATE AND l.status = 'completed'
         ) AS completed_today,
         ROUND(s.current_streak::numeric / NULLIF(h.target_days,0) * 100, 1) AS progress_pct
       FROM habits h
       LEFT JOIN streaks s ON s.habit_id = h.id
       WHERE h.user_id = $1 AND h.archived = false
       ORDER BY h.created_at DESC`,
      [friendId]
    );

    const { rows: statsRows } = await query(
      `SELECT
         COALESCE(MAX(s.best_streak), 0)    AS best_streak,
         COALESCE(SUM(s.current_streak), 0) AS total_streak,
         COUNT(DISTINCT h.id)               AS total_habits
       FROM habits h
       LEFT JOIN streaks s ON s.habit_id = h.id
       WHERE h.user_id = $1 AND h.archived = false`,
      [friendId]
    );

    return {
      user:   userRows[0],
      habits,
      stats:  statsRows[0],
    };
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
