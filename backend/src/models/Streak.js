const { query } = require('../config/db');

const Streak = {
  async findByHabit(habitId) {
    const { rows } = await query('SELECT * FROM streaks WHERE habit_id = $1', [habitId]);
    return rows[0] || null;
  },

  // Recalculate streak from habit_logs (called after every check-in/undo)
  async recalculate(habitId) {
    const { rows: logs } = await query(
      `SELECT date FROM habit_logs
       WHERE habit_id = $1 AND status = 'completed'
       ORDER BY date DESC`,
      [habitId]
    );

    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (const log of logs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      const diff = Math.round((cursor - logDate) / 86400000);
      if (diff <= 1) {
        streak++;
        cursor = logDate;
      } else {
        break;
      }
    }

    const { rows } = await query(
      `UPDATE streaks
       SET current_streak = $1,
           best_streak    = GREATEST(best_streak, $1),
           last_check_in  = CURRENT_DATE,
           updated_at     = NOW()
       WHERE habit_id = $2
       RETURNING *`,
      [streak, habitId]
    );
    return rows[0];
  },

  async useFreeze(habitId) {
    const { rows } = await query(
      `UPDATE streaks
       SET freeze_count = freeze_count - 1,
           updated_at   = NOW()
       WHERE habit_id = $1 AND freeze_count > 0
       RETURNING *`,
      [habitId]
    );
    if (!rows[0]) throw new Error('No streak freezes available');
    await query(
      'INSERT INTO streak_freezes (habit_id, used_on) VALUES ($1, CURRENT_DATE)',
      [habitId]
    );
    return rows[0];
  },

  async earnFreeze(habitId) {
    const { rows } = await query(
      `UPDATE streaks
       SET freeze_count = freeze_count + 1,
           updated_at   = NOW()
       WHERE habit_id = $1
       RETURNING *`,
      [habitId]
    );
    return rows[0];
  },

  async leaderboard(userId) {
    const { rows } = await query(
      `SELECT u.id, u.name, u.profile_picture,
              COALESCE(SUM(s.current_streak), 0) AS total_streak,
              COALESCE(MAX(s.best_streak), 0)    AS best_streak
       FROM friends f
       JOIN users u ON (
         CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END = u.id
       )
       LEFT JOIN habits h  ON h.user_id = u.id AND h.archived = false
       LEFT JOIN streaks s ON s.habit_id = h.id
       WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'
       GROUP BY u.id, u.name, u.profile_picture
       ORDER BY total_streak DESC
       LIMIT 20`,
      [userId]
    );
    return rows;
  },
};

module.exports = Streak;
