const Habit = require('../models/Habit');
const emailService = require('./emailService');
const logger = require('../utils/logger');

const reminderService = {
  async sendDueReminders() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hh}:${mm}`;

    logger.info(`Running reminders for ${currentTime}`);

    const habits = await Habit.findDueForReminder(currentTime);
    logger.info(`Found ${habits.length} habits due for reminder`);

    const results = await Promise.allSettled(
      habits.map((h) =>
        emailService.sendHabitReminder(h.email, h.user_name, h.name, h.why_reason)
      )
    );

    const sent   = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    logger.info(`Reminders: ${sent} sent, ${failed} failed`);
    return { sent, failed, total: habits.length };
  },
};

module.exports = reminderService;
