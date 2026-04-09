const router = require('express').Router();
const { body, param } = require('express-validator');
const friendController  = require('../controllers/friendController');
const messageController = require('../controllers/messageController');
const auth     = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(auth);

const friendIdParam = param('friendId').isInt({ min: 1 }).withMessage('Invalid friend ID');

// Friend list & leaderboard
router.get('/',            friendController.index);
router.get('/leaderboard', friendController.leaderboard);

// Friend requests
router.post(
  '/request',
  [body('email').isEmail().normalizeEmail()],
  validate,
  friendController.sendRequest
);
router.post(
  '/accept',
  [body('requesterId').isInt({ min: 1 })],
  validate,
  friendController.accept
);
router.delete('/:friendId', [friendIdParam], validate, friendController.remove);

// Friend profile (view their habits & stats)
router.get('/:friendId/profile', [friendIdParam], validate, friendController.profile);

// ── Messages ─────────────────────────────────────────────────
router.get('/messages/unread',       messageController.unreadCounts);
router.get('/messages/:friendId',    [friendIdParam], validate, messageController.getConversation);
router.post(
  '/messages/:friendId',
  [
    friendIdParam,
    body('content').notEmpty().withMessage('Message cannot be empty').isLength({ max: 2000 }),
  ],
  validate,
  messageController.send
);

module.exports = router;
