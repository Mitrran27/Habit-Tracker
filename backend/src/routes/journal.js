const router = require('express').Router();
const { body, param } = require('express-validator');
const journalController = require('../controllers/journalController');
const auth     = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(auth);

const idParam    = param('id').isInt({ min: 1 });
const moodValues = ['happy', 'normal', 'sad', 'tired', 'stressed'];

router.get('/',             journalController.index);
router.get('/mood-history', journalController.moodHistory);
router.get('/:id',          [idParam], validate, journalController.show);

router.post(
  '/',
  [
    body('content').notEmpty().withMessage('Content is required'),
    // mood is optional — allow null/empty (frontend sends null when not selected)
    body('mood').optional({ nullable: true }).isIn([...moodValues, null, '']).withMessage('Invalid mood'),
    // date is optional — allow any string or omit (model defaults to today)
    body('date').optional({ nullable: true }),
  ],
  validate,
  journalController.create
);

router.patch(
  '/:id',
  [
    idParam,
    body('mood').optional({ nullable: true }).isIn([...moodValues, null, '']),
  ],
  validate,
  journalController.update
);

router.delete('/:id', [idParam], validate, journalController.delete);

module.exports = router;
