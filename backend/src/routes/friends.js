const router = require('express').Router();
const { body, param } = require('express-validator');
const friendController = require('../controllers/friendController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(auth);

router.get('/',              friendController.index);
router.get('/leaderboard',   friendController.leaderboard);

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

router.delete(
  '/:friendId',
  [param('friendId').isInt({ min: 1 })],
  validate,
  friendController.remove
);

module.exports = router;
