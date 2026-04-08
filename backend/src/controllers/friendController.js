const Friend = require('../models/Friend');
const User = require('../models/User');
const Streak = require('../models/Streak');
const { success, created, notFound, badRequest } = require('../utils/apiResponse');

const friendController = {
  async index(req, res, next) {
    try {
      const friends = await Friend.findAll(req.user.id);
      return success(res, { friends });
    } catch (err) {
      next(err);
    }
  },

  async sendRequest(req, res, next) {
    try {
      const { email } = req.body;
      const target = await User.findByEmail(email);

      if (!target) return notFound(res, 'User');
      if (target.id === req.user.id) return badRequest(res, 'Cannot add yourself');

      const existing = await Friend.findRequest(req.user.id, target.id);
      if (existing) return badRequest(res, 'Friend request already exists');

      const request = await Friend.sendRequest(req.user.id, target.id);
      return created(res, { request });
    } catch (err) {
      next(err);
    }
  },

  async accept(req, res, next) {
    try {
      const { requesterId } = req.body;
      const friendship = await Friend.accept(+requesterId, req.user.id);
      if (!friendship) return notFound(res, 'Friend request');
      return success(res, { friendship });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const ok = await Friend.remove(req.user.id, +req.params.friendId);
      if (!ok) return notFound(res, 'Friend');
      return success(res, { message: 'Friend removed' });
    } catch (err) {
      next(err);
    }
  },

  async leaderboard(req, res, next) {
    try {
      const board = await Streak.leaderboard(req.user.id);
      return success(res, { leaderboard: board });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = friendController;
