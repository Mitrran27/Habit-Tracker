const { query } = require('../config/db');
const { today } = require('../utils/dateHelpers');

const HabitLog = {
  async upsert(habitId, { status = 'completed', notes, mood, time_spent_minutes, date }) {
    const logDate = date || today();
    const { rows } = await query(
      `INSERT INTO habit_logs (habit_id, date, status, notes, mood, time_spent_minutes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (habit_id, date)
       DO UPDATE SET
         status              = EXCLUDED.status,
         notes               = EXCLUDED.notes,
         mood                = EXCLUDED.mood,
         time_spent_minutes  = EXCLUDED.time_spent_minutes
       RETURNING *`,
      [habitId, logDate, status, notes, mood, time_spent_minutes]
    );
    return rows[0];
  },

  async deleteToday(habitId) {
    const { rowCount } = await query(
      'DELETE FROM habit_logs WHERE habit_id = $1 AND date = $2',
      [habitId, today()]
    );
    return rowCount > 0;
  },

  async findByHabit(habitId, { from, to, limit = 90 } = {}) {
    const { rows } = await query(
      `SELECT * FROM habit_logs
       WHERE habit_id = $1
         AND ($2::date IS NULL OR date >= $2)
         AND ($3::date IS NULL OR date <= $3)
       ORDER BY date DESC
       LIMIT $4`,
      [habitId, from || null, to || null, limit]
    );
    return rows;
  },

  async findByUser(userId, { from, to } = {}) {
    const { rows } = await query(
      `SELECT l.*, h.name AS habit_name, h.icon, h.color
       FROM habit_logs l
       JOIN habits h ON h.id = l.habit_id
       WHERE h.user_id = $1
         AND ($2::date IS NULL OR l.date >= $2)
         AND ($3::date IS NULL OR l.date <= $3)
       ORDER BY l.date DESC`,
      [userId, from || null, to || null]
    );
    return rows;
  },

  // Returns all completed dates as an array of 'YYYY-MM-DD' strings for calendar view
  async completedDates(habitId, year, month) {
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const to   = `${year}-${String(month).padStart(2, '0')}-31`;
    const { rows } = await query(
      `SELECT date::text FROM habit_logs
       WHERE habit_id = $1 AND status = 'completed'
         AND date BETWEEN $2 AND $3`,
      [habitId, from, to]
    );
    return rows.map((r) => r.date);
  },

  // Weekly completion count per day-of-week (for heatmap)
  async weeklyPattern(userId) {
    const { rows } = await query(
      `SELECT EXTRACT(DOW FROM l.date)::int AS day_of_week,
              COUNT(*) FILTER (WHERE l.status = 'completed') AS completed,
              COUNT(*) AS total
       FROM habit_logs l
       JOIN habits h ON h.id = l.habit_id
       WHERE h.user_id = $1 AND l.date >= NOW() - INTERVAL '90 days'
       GROUP BY day_of_week
       ORDER BY day_of_week`,
      [userId]
    );
    return rows;
  },
};

module.exports = HabitLog;
