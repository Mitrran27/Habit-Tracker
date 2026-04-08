const router = require('express').Router();
const reminderService = require('../services/reminderService');
const { success, forbidden } = require('../utils/apiResponse');

// Called by external cron every minute
// e.g. curl -X POST https://api.example.com/api/reminders/send -H "x-cron-secret: ..."
router.post('/send', async (req, res, next) => {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return forbidden(res, 'Invalid cron secret');
  }
  try {
    const result = await reminderService.sendDueReminders();
    return success(res, result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
