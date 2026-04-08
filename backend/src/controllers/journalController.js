const Journal = require('../models/Journal');
const { success, created, notFound } = require('../utils/apiResponse');

const journalController = {
  async index(req, res, next) {
    try {
      const { limit, offset } = req.query;
      const entries = await Journal.findAllByUser(req.user.id, {
        limit: limit ? +limit : 50,
        offset: offset ? +offset : 0,
      });
      return success(res, { entries });
    } catch (err) {
      next(err);
    }
  },

  async show(req, res, next) {
    try {
      const entry = await Journal.findById(req.params.id, req.user.id);
      if (!entry) return notFound(res, 'Journal entry');
      return success(res, { entry });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { content, mood, date } = req.body;
      const entry = await Journal.create(req.user.id, { content, mood, date });
      return created(res, { entry });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { content, mood } = req.body;
      const entry = await Journal.update(req.params.id, req.user.id, { content, mood });
      if (!entry) return notFound(res, 'Journal entry');
      return success(res, { entry });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const ok = await Journal.delete(req.params.id, req.user.id);
      if (!ok) return notFound(res, 'Journal entry');
      return success(res, { message: 'Entry deleted' });
    } catch (err) {
      next(err);
    }
  },

  async moodHistory(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const history = await Journal.moodHistory(req.user.id, +days);
      return success(res, { history });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = journalController;
