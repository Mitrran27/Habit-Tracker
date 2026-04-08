const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const Streak = require('../models/Streak');
const Achievement = require('../models/Achievement');
const { success, created, notFound, badRequest } = require('../utils/apiResponse');

const habitController = {
  async index(req, res, next) {
    try {
      const { category, type, archived } = req.query;
      const habits = await Habit.findAllByUser(req.user.id, {
        category,
        type,
        archived: archived === 'true',
      });
      return success(res, { habits });
    } catch (err) {
      next(err);
    }
  },

  async show(req, res, next) {
    try {
      const habit = await Habit.findById(req.params.id, req.user.id);
      if (!habit) return notFound(res, 'Habit');
      return success(res, { habit });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const habit = await Habit.create(req.user.id, req.body);
      const newAchievements = await Achievement.checkAndAward(req.user.id);
      return created(res, { habit, achievements: newAchievements });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const habit = await Habit.update(req.params.id, req.user.id, req.body);
      if (!habit) return notFound(res, 'Habit');
      return success(res, { habit });
    } catch (err) {
      next(err);
    }
  },

  async archive(req, res, next) {
    try {
      const ok = await Habit.archive(req.params.id, req.user.id);
      if (!ok) return notFound(res, 'Habit');
      return success(res, { message: 'Habit archived' });
    } catch (err) {
      next(err);
    }
  },

  async restore(req, res, next) {
    try {
      const ok = await Habit.restore(req.params.id, req.user.id);
      if (!ok) return notFound(res, 'Habit');
      return success(res, { message: 'Habit restored' });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/habits/:id/checkin
  async checkIn(req, res, next) {
    try {
      const habit = await Habit.findById(req.params.id, req.user.id);
      if (!habit) return notFound(res, 'Habit');

      const { status = 'completed', notes, mood, time_spent_minutes, date } = req.body;

      const log = await HabitLog.upsert(habit.id, { status, notes, mood, time_spent_minutes, date });
      const streak = await Streak.recalculate(habit.id);
      const achievements = await Achievement.checkAndAward(req.user.id);

      return success(res, { log, streak, achievements });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/habits/:id/checkin  — undo today
  async undoCheckIn(req, res, next) {
    try {
      const habit = await Habit.findById(req.params.id, req.user.id);
      if (!habit) return notFound(res, 'Habit');

      await HabitLog.deleteToday(habit.id);
      const streak = await Streak.recalculate(habit.id);

      return success(res, { streak });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/habits/:id/logs
  async logs(req, res, next) {
    try {
      const habit = await Habit.findById(req.params.id, req.user.id);
      if (!habit) return notFound(res, 'Habit');

      const { from, to, limit } = req.query;
      const logs = await HabitLog.findByHabit(habit.id, { from, to, limit: limit ? +limit : 90 });

      return success(res, { logs });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/habits/:id/calendar?year=2024&month=6
  async calendar(req, res, next) {
    try {
      const habit = await Habit.findById(req.params.id, req.user.id);
      if (!habit) return notFound(res, 'Habit');

      const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
      const dates = await HabitLog.completedDates(habit.id, +year, +month);

      return success(res, { dates });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/habits/:id/freeze
  async useFreeze(req, res, next) {
    try {
      const habit = await Habit.findById(req.params.id, req.user.id);
      if (!habit) return notFound(res, 'Habit');

      const streak = await Streak.useFreeze(habit.id);
      return success(res, { streak });
    } catch (err) {
      if (err.message === 'No streak freezes available') return badRequest(res, err.message);
      next(err);
    }
  },
};

module.exports = habitController;
