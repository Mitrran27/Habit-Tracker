const { query } = require('../config/db');

const Journal = {
  async findAllByUser(userId, { limit = 50, offset = 0 } = {}) {
    const { rows } = await query(
      `SELECT * FROM journal_entries
       WHERE user_id = $1
       ORDER BY date DESC, created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  },

  async findById(id, userId) {
    const { rows } = await query(
      'SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rows[0] || null;
  },

  async create(userId, { content, mood, date }) {
    const { rows } = await query(
      `INSERT INTO journal_entries (user_id, content, mood, date)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE))
       RETURNING *`,
      [userId, content, mood, date]
    );
    return rows[0];
  },

  async update(id, userId, { content, mood }) {
    const { rows } = await query(
      `UPDATE journal_entries
       SET content = COALESCE($1, content),
           mood    = COALESCE($2, mood)
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [content, mood, id, userId]
    );
    return rows[0] || null;
  },

  async delete(id, userId) {
    const { rowCount } = await query(
      'DELETE FROM journal_entries WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rowCount > 0;
  },

  async moodHistory(userId, days = 30) {
    const { rows } = await query(
      `SELECT date, mood, COUNT(*) AS count
       FROM journal_entries
       WHERE user_id = $1
         AND date >= NOW() - ($2 || ' days')::interval
         AND mood IS NOT NULL
       GROUP BY date, mood
       ORDER BY date DESC`,
      [userId, days]
    );
    return rows;
  },
};

module.exports = Journal;
