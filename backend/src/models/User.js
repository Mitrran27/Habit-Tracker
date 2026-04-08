const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

const SAFE_FIELDS = 'id, name, email, profile_picture, timezone, dark_mode, created_at, updated_at';

const User = {
  async findById(id) {
    const { rows } = await query(`SELECT ${SAFE_FIELDS} FROM users WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    return rows[0] || null;
  },

  async create({ name, email, password }) {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING ${SAFE_FIELDS}`,
      [name, email.toLowerCase(), hash]
    );
    return rows[0];
  },

  async update(id, { name, profile_picture, timezone, dark_mode }) {
    const { rows } = await query(
      `UPDATE users
       SET name             = COALESCE($1, name),
           profile_picture  = COALESCE($2, profile_picture),
           timezone         = COALESCE($3, timezone),
           dark_mode        = COALESCE($4, dark_mode),
           updated_at       = NOW()
       WHERE id = $5
       RETURNING ${SAFE_FIELDS}`,
      [name, profile_picture, timezone, dark_mode, id]
    );
    return rows[0] || null;
  },

  async updatePassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, 12);
    await query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2',
      [hash, id]
    );
  },

  async setResetToken(id, token) {
    await query(
      "UPDATE users SET reset_token = $1, reset_expires = NOW() + INTERVAL '1 hour' WHERE id = $2",
      [token, id]
    );
  },

  async findByResetToken(token) {
    const { rows } = await query(
      'SELECT id, name, email FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
      [token]
    );
    return rows[0] || null;
  },

  async verifyPassword(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  },

  async delete(id) {
    await query('DELETE FROM users WHERE id = $1', [id]);
  },
};

module.exports = User;
