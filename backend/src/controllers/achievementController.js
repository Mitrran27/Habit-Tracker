const Achievement = require('../models/Achievement');
const { success } = require('../utils/apiResponse');

const achievementController = {
  async all(req, res, next) {
    try {
      const achievements = await Achievement.findAll();
      return success(res, { achievements });
    } catch (err) {
      next(err);
    }
  },

  async earned(req, res, next) {
    try {
      const achievements = await Achievement.findEarned(req.user.id);
      return success(res, { achievements });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = achievementController;
