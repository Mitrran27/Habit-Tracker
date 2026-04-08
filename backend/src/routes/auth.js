const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const passwordRules = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters');

// Public
router.post(
  '/register',
  authLimiter,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    passwordRules,
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  authController.login
);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail()],
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  [body('token').notEmpty(), passwordRules],
  validate,
  authController.resetPassword
);

// Protected
router.get('/me',            auth, authController.me);
router.patch('/me',          auth, authController.updateProfile);
router.delete('/me',         auth, authController.deleteAccount);

module.exports = router;
