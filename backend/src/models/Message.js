const { query } = require('../config/db');

const Message = {
  // Get all messages between two users, oldest first (for chat display)
  async getConversation(userAId, userBId, limit = 200) {
    const { rows } = await query(
      `SELECT
         m.id,
         m.sender_id,
         m.receiver_id,
         m.content,
         m.read_at,
         m.created_at,
         u.name AS sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE
         (m.sender_id = $1 AND m.receiver_id = $2)
         OR
         (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC
       LIMIT $3`,
      [userAId, userBId, limit]
    );
    return rows;
  },

  // Send a message
  async send(senderId, receiverId, content) {
    const { rows } = await query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [senderId, receiverId, content.trim()]
    );
    return rows[0];
  },

  // Mark all messages from sender to receiver as read
  async markRead(senderId, receiverId) {
    await query(
      `UPDATE messages
       SET read_at = NOW()
       WHERE sender_id = $1 AND receiver_id = $2 AND read_at IS NULL`,
      [senderId, receiverId]
    );
  },

  // Get unread message count per conversation for a user
  async unreadCounts(userId) {
    const { rows } = await query(
      `SELECT sender_id, COUNT(*) AS unread
       FROM messages
       WHERE receiver_id = $1 AND read_at IS NULL
       GROUP BY sender_id`,
      [userId]
    );
    return rows;
  },

  // Get last message of each conversation (for friend list preview)
  async lastMessages(userId) {
    const { rows } = await query(
      `SELECT DISTINCT ON (
           LEAST(sender_id, receiver_id),
           GREATEST(sender_id, receiver_id)
         )
         m.id,
         m.sender_id,
         m.receiver_id,
         m.content,
         m.created_at,
         u.name AS sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY
         LEAST(sender_id, receiver_id),
         GREATEST(sender_id, receiver_id),
         m.created_at DESC`,
      [userId]
    );
    return rows;
  },
};

module.exports = Message;
