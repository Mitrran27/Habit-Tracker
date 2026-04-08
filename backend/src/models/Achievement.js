const { query } = require('../config/db');

const Achievement = {
  async findAll() {
    const { rows } = await query('SELECT * FROM achievements ORDER BY id');
    return rows;
  },

  async findEarned(userId) {
    const { rows } = await query(
      `SELECT a.*, ua.earned_at
       FROM user_achievements ua
       JOIN achievements a ON a.id = ua.achievement_id
       WHERE ua.user_id = $1
       ORDER BY ua.earned_at DESC`,
      [userId]
    );
    return rows;
  },

  async award(userId, achievementCode) {
    const { rows: ach } = await query(
      'SELECT id FROM achievements WHERE code = $1',
      [achievementCode]
    );
    if (!ach[0]) return null;

    const { rows } = await query(
      `INSERT INTO user_achievements (user_id, achievement_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [userId, ach[0].id]
    );
    return rows[0] || null;
  },

  // Check and award any newly earned achievements for a user
  async checkAndAward(userId) {
    const awarded = [];

    // Habit count achievements
    const { rows: habitCount } = await query(
      'SELECT COUNT(*) AS count FROM habits WHERE user_id = $1 AND archived = false',
      [userId]
    );
    const count = +habitCount[0].count;
    if (count >= 1)  awarded.push(await Achievement.award(userId, 'first_habit'));
    if (count >= 5)  awarded.push(await Achievement.award(userId, 'five_habits'));

    // Streak achievements
    const { rows: streaks } = await query(
      `SELECT s.current_streak, s.best_streak
       FROM streaks s JOIN habits h ON h.id = s.habit_id
       WHERE h.user_id = $1`,
      [userId]
    );
    const maxStreak = Math.max(0, ...streaks.map((s) => s.current_streak));
    if (maxStreak >= 7)   awarded.push(await Achievement.award(userId, 'streak_7'));
    if (maxStreak >= 30)  awarded.push(await Achievement.award(userId, 'streak_30'));
    if (maxStreak >= 100) awarded.push(await Achievement.award(userId, 'streak_100'));

    return awarded.filter(Boolean);
  },
};

module.exports = Achievement;
