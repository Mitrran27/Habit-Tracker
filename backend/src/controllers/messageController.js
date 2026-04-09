const Message = require('../models/Message');
const Friend  = require('../models/Friend');
const { success, created, forbidden, badRequest } = require('../utils/apiResponse');

const messageController = {
  // GET /api/messages/:friendId — load full conversation
  async getConversation(req, res, next) {
    try {
      const friendId = +req.params.friendId;
      const ok = await Friend.areFriends(req.user.id, friendId);
      if (!ok) return forbidden(res, 'You are not friends with this user');

      const messages = await Message.getConversation(req.user.id, friendId);

      // Mark incoming messages as read
      await Message.markRead(friendId, req.user.id);

      return success(res, { messages });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/messages/:friendId — send a message
  async send(req, res, next) {
    try {
      const friendId = +req.params.friendId;
      const { content } = req.body;

      if (!content?.trim()) return badRequest(res, 'Message content is required');

      const ok = await Friend.areFriends(req.user.id, friendId);
      if (!ok) return forbidden(res, 'You are not friends with this user');

      const message = await Message.send(req.user.id, friendId, content);
      return created(res, { message });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/messages/unread — unread counts per conversation
  async unreadCounts(req, res, next) {
    try {
      const counts = await Message.unreadCounts(req.user.id);
      return success(res, { counts });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = messageController;
