const Stats = require('../models/Stats');
const HabitLog = require('../models/HabitLog');
const { success } = require('../utils/apiResponse');

const statsController = {
  async dashboard(req, res, next) {
    try {
      const data = await Stats.dashboard(req.user.id);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async weekly(req, res, next) {
    try {
      const data = await Stats.weeklyBreakdown(req.user.id);
      return success(res, { breakdown: data });
    } catch (err) {
      next(err);
    }
  },

  async monthly(req, res, next) {
    try {
      const data = await Stats.monthlyBreakdown(req.user.id);
      return success(res, { breakdown: data });
    } catch (err) {
      next(err);
    }
  },

  async categories(req, res, next) {
    try {
      const data = await Stats.categoryBreakdown(req.user.id);
      return success(res, { categories: data });
    } catch (err) {
      next(err);
    }
  },

  async moodCorrelation(req, res, next) {
    try {
      const data = await Stats.moodCorrelation(req.user.id);
      return success(res, { correlation: data });
    } catch (err) {
      next(err);
    }
  },

  async bestWorst(req, res, next) {
    try {
      const data = await Stats.bestAndWorstHabits(req.user.id);
      return success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async heatmap(req, res, next) {
    try {
      const data = await HabitLog.weeklyPattern(req.user.id);
      return success(res, { pattern: data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = statsController;
