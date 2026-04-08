const { query, transaction } = require('../config/db');

const Habit = {
  async findAllByUser(userId, filters = {}) {
    const { category, type, archived = false } = filters;
    const conditions = ['h.user_id = $1', 'h.archived = $2'];
    const params = [userId, archived];
    let p = 3;

    if (category) { conditions.push(`h.category = $${p++}`); params.push(category); }
    if (type)     { conditions.push(`h.type = $${p++}`);     params.push(type); }

    const { rows } = await query(
      `SELECT
         h.*,
         s.current_streak,
         s.best_streak,
         s.freeze_count,
         EXISTS(
           SELECT 1 FROM habit_logs l
           WHERE l.habit_id = h.id
             AND l.date = CURRENT_DATE
             AND l.status = 'completed'
         ) AS completed_today,
         ROUND(s.current_streak::numeric / NULLIF(h.target_days, 0) * 100, 1) AS progress_pct
       FROM habits h
       LEFT JOIN streaks s ON s.habit_id = h.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY h.created_at DESC`,
      params
    );
    return rows;
  },

  async findById(id, userId) {
    const { rows } = await query(
      `SELECT
         h.*,
         s.current_streak,
         s.best_streak,
         s.freeze_count
       FROM habits h
       LEFT JOIN streaks s ON s.habit_id = h.id
       WHERE h.id = $1 AND h.user_id = $2`,
      [id, userId]
    );
    return rows[0] || null;
  },

  async create(userId, data) {
    const {
      name, description, type = 'daily', category = 'personal',
      difficulty = 'medium', reminder_time,
      // default start_date to today if frontend doesn't send it
      start_date = new Date().toISOString().split('T')[0],
      target_days = 30,
      color = '#6C63FF', icon, why_reason, track_time = false, bad_habit = false,
    } = data;

    return transaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO habits
           (user_id, name, description, type, category, difficulty,
            reminder_time, start_date, target_days, color, icon, why_reason,
            track_time, bad_habit)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING *`,
        [userId, name, description, type, category, difficulty,
         reminder_time || null, start_date, target_days, color, icon, why_reason,
         track_time, bad_habit]
      );
      const habit = rows[0];

      await client.query(
        'INSERT INTO streaks (habit_id, current_streak, best_streak) VALUES ($1, 0, 0)',
        [habit.id]
      );

      return { ...habit, current_streak: 0, best_streak: 0, freeze_count: 0, completed_today: false, progress_pct: 0 };
    });
  },

  async update(id, userId, data) {
    const {
      name, description, type, category, difficulty,
      reminder_time, target_days, color, icon, why_reason, track_time, bad_habit,
    } = data;

    const { rows } = await query(
      `UPDATE habits SET
         name          = COALESCE($1,  name),
         description   = COALESCE($2,  description),
         type          = COALESCE($3,  type),
         category      = COALESCE($4,  category),
         difficulty    = COALESCE($5,  difficulty),
         reminder_time = COALESCE($6,  reminder_time),
         target_days   = COALESCE($7,  target_days),
         color         = COALESCE($8,  color),
         icon          = COALESCE($9,  icon),
         why_reason    = COALESCE($10, why_reason),
         track_time    = COALESCE($11, track_time),
         bad_habit     = COALESCE($12, bad_habit),
         updated_at    = NOW()
       WHERE id = $13 AND user_id = $14
       RETURNING *`,
      [name, description, type, category, difficulty,
       reminder_time, target_days, color, icon, why_reason,
       track_time, bad_habit, id, userId]
    );
    return rows[0] || null;
  },

  async archive(id, userId) {
    const { rows } = await query(
      'UPDATE habits SET archived = true, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return !!rows[0];
  },

  async restore(id, userId) {
    const { rows } = await query(
      'UPDATE habits SET archived = false, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return !!rows[0];
  },

  async findDueForReminder(time) {
    const { rows } = await query(
      `SELECT h.id, h.name, h.why_reason, u.email, u.name AS user_name
       FROM habits h
       JOIN users u ON u.id = h.user_id
       LEFT JOIN habit_logs l
         ON l.habit_id = h.id AND l.date = CURRENT_DATE
       WHERE h.reminder_time = $1
         AND h.archived = false
         AND l.id IS NULL`,
      [time]
    );
    return rows;
  },
};

module.exports = Habit;
