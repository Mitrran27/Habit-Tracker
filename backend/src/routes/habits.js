const router = require('express').Router();
const { body, param } = require('express-validator');
const habitController = require('../controllers/habitController');
const auth     = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(auth);

const idParam = param('id').isInt({ min: 1 }).withMessage('Invalid habit ID');

// Collection
router.get('/', habitController.index);
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Habit name is required').isLength({ max: 100 }),
    body('type').optional().isIn(['daily', 'weekly', 'monthly']),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    body('category').optional().isIn(['health','fitness','study','productivity','finance','mental','personal']),
    body('target_days').optional().isInt({ min: 1, max: 365 }),
    // Allow any hex color including short codes — just check it starts with #
    body('color').optional({ nullable: true }).custom((v) => !v || /^#[0-9A-Fa-f]{3,8}$/.test(v)).withMessage('Invalid color'),
  ],
  validate,
  habitController.create
);

// Single habit
router.get('/:id',           [idParam], validate, habitController.show);
router.patch('/:id',         [idParam], validate, habitController.update);
router.delete('/:id',        [idParam], validate, habitController.archive);
router.post('/:id/restore',  [idParam], validate, habitController.restore);

// Check-in — mood is nullable (user may not have selected one)
router.post(
  '/:id/checkin',
  [
    idParam,
    body('status').optional().isIn(['completed', 'missed', 'skipped']),
    body('mood').optional({ nullable: true }).isIn(['happy', 'normal', 'sad', 'tired', 'stressed', null, '']),
    body('time_spent_minutes').optional({ nullable: true }).isInt({ min: 1 }),
  ],
  validate,
  habitController.checkIn
);
router.delete('/:id/checkin', [idParam], validate, habitController.undoCheckIn);

// Logs & calendar
router.get('/:id/logs',     [idParam], validate, habitController.logs);
router.get('/:id/calendar', [idParam], validate, habitController.calendar);

// Streak freeze
router.post('/:id/freeze', [idParam], validate, habitController.useFreeze);

module.exports = router;
