const { query } = require('../config/db');

const Stats = {
  async dashboard(userId) {
    const [habits, streakData, weekData, monthData, todayData] = await Promise.all([
      query(
        'SELECT COUNT(*) AS total FROM habits WHERE user_id = $1 AND archived = false',
        [userId]
      ),
      query(
        `SELECT
           COALESCE(MAX(s.best_streak), 0)    AS best_streak,
           COALESCE(SUM(s.current_streak), 0) AS total_streak
         FROM streaks s
         JOIN habits h ON h.id = s.habit_id
         WHERE h.user_id = $1`,
        [userId]
      ),
      query(
        `SELECT
           COUNT(*) FILTER (WHERE l.status = 'completed') AS completed,
           COUNT(*) AS total
         FROM habit_logs l
         JOIN habits h ON h.id = l.habit_id
         WHERE h.user_id = $1 AND l.date >= NOW() - INTERVAL '7 days'`,
        [userId]
      ),
      query(
        `SELECT
           COUNT(*) FILTER (WHERE l.status = 'completed') AS completed,
           COUNT(*) AS total
         FROM habit_logs l
         JOIN habits h ON h.id = l.habit_id
         WHERE h.user_id = $1
           AND date_trunc('month', l.date) = date_trunc('month', NOW())`,
        [userId]
      ),
      query(
        `SELECT
           COUNT(*) FILTER (WHERE l.status = 'completed') AS completed,
           COUNT(*) AS total_habits
         FROM habits h
         LEFT JOIN habit_logs l ON l.habit_id = h.id AND l.date = CURRENT_DATE
         WHERE h.user_id = $1 AND h.archived = false`,
        [userId]
      ),
    ]);

    return {
      total_habits:          +habits.rows[0].total,
      best_streak:           +streakData.rows[0].best_streak,
      total_streak:          +streakData.rows[0].total_streak,
      week_completed:        +weekData.rows[0].completed,
      week_total:            +weekData.rows[0].total,
      week_rate:             weekData.rows[0].total > 0
                               ? Math.round((weekData.rows[0].completed / weekData.rows[0].total) * 100)
                               : 0,
      month_completed:       +monthData.rows[0].completed,
      month_total:           +monthData.rows[0].total,
      today_completed:       +todayData.rows[0].completed,
      today_total:           +todayData.rows[0].total_habits,
    };
  },

  async weeklyBreakdown(userId) {
    const { rows } = await query(
      `SELECT
         l.date::text,
         COUNT(*) FILTER (WHERE l.status = 'completed') AS completed,
         COUNT(*) FILTER (WHERE l.status = 'missed')    AS missed,
         COUNT(*) FILTER (WHERE l.status = 'skipped')   AS skipped,
         COUNT(*) AS total
       FROM habit_logs l
       JOIN habits h ON h.id = l.habit_id
       WHERE h.user_id = $1 AND l.date >= NOW() - INTERVAL '7 days'
       GROUP BY l.date
       ORDER BY l.date`,
      [userId]
    );
    return rows;
  },

  async monthlyBreakdown(userId) {
    const { rows } = await query(
      `SELECT
         TO_CHAR(l.date, 'YYYY-MM') AS month,
         COUNT(*) FILTER (WHERE l.status = 'completed') AS completed,
         COUNT(*) AS total,
         ROUND(COUNT(*) FILTER (WHERE l.status = 'completed')::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS rate
       FROM habit_logs l
       JOIN habits h ON h.id = l.habit_id
       WHERE h.user_id = $1 AND l.date >= NOW() - INTERVAL '12 months'
       GROUP BY month
       ORDER BY month`,
      [userId]
    );
    return rows;
  },

  async categoryBreakdown(userId) {
    const { rows } = await query(
      `SELECT
         h.category,
         COUNT(DISTINCT h.id) AS habit_count,
         COUNT(*) FILTER (WHERE l.status = 'completed') AS completed,
         COUNT(*) AS total,
         ROUND(COUNT(*) FILTER (WHERE l.status = 'completed')::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS rate
       FROM habits h
       LEFT JOIN habit_logs l ON l.habit_id = h.id AND l.date >= NOW() - INTERVAL '30 days'
       WHERE h.user_id = $1 AND h.archived = false
       GROUP BY h.category
       ORDER BY rate DESC NULLS LAST`,
      [userId]
    );
    return rows;
  },

  async moodCorrelation(userId) {
    const { rows } = await query(
      `SELECT
         l.mood,
         ROUND(AVG(daily.completed)::numeric, 1) AS avg_completed,
         COUNT(*) AS days_tracked
       FROM (
         SELECT l2.date, l2.mood,
                COUNT(*) FILTER (WHERE l2.status = 'completed') AS completed
         FROM habit_logs l2
         JOIN habits h ON h.id = l2.habit_id
         WHERE h.user_id = $1 AND l2.mood IS NOT NULL
         GROUP BY l2.date, l2.mood
       ) daily
       JOIN habit_logs l ON l.date = daily.date AND l.mood = daily.mood
       JOIN habits h ON h.id = l.habit_id AND h.user_id = $1
       GROUP BY l.mood
       ORDER BY avg_completed DESC`,
      [userId]
    );
    return rows;
  },

  async bestAndWorstHabits(userId) {
    const { rows } = await query(
      `SELECT
         h.id, h.name, h.icon, h.color,
         s.current_streak, s.best_streak,
         COUNT(*) FILTER (WHERE l.status = 'completed') AS completions,
         COUNT(*) AS total_logged,
         ROUND(COUNT(*) FILTER (WHERE l.status = 'completed')::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS success_rate
       FROM habits h
       LEFT JOIN streaks s ON s.habit_id = h.id
       LEFT JOIN habit_logs l ON l.habit_id = h.id AND l.date >= NOW() - INTERVAL '30 days'
       WHERE h.user_id = $1 AND h.archived = false
       GROUP BY h.id, h.name, h.icon, h.color, s.current_streak, s.best_streak
       ORDER BY success_rate DESC NULLS LAST`,
      [userId]
    );
    return {
      best:  rows.slice(0, 3),
      worst: [...rows].sort((a, b) => a.success_rate - b.success_rate).slice(0, 3),
    };
  },
};

module.exports = Stats;
