const User = require('../models/User');
const { sign } = require('../config/jwt');
const { success, created, badRequest, unauthorized, error } = require('../utils/apiResponse');
const emailService = require('../services/emailService');

const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      const existing = await User.findByEmail(email);
      if (existing) return badRequest(res, 'Email already registered');

      const user = await User.create({ name, email, password });
      const token = sign({ id: user.id, email: user.email });

      return created(res, { user, token });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) return unauthorized(res, 'Invalid credentials');

      const valid = await User.verifyPassword(password, user.password_hash);
      if (!valid) return unauthorized(res, 'Invalid credentials');

      const { password_hash, reset_token, reset_expires, ...safeUser } = user;
      const token = sign({ id: user.id, email: user.email });

      return success(res, { user: safeUser, token });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findByEmail(email);

      // Always return 200 to prevent email enumeration
      if (!user) return success(res, { message: 'If that email exists, a reset link has been sent.' });

      const token = sign({ id: user.id, purpose: 'reset' });
      await User.setResetToken(user.id, token);
      await emailService.sendPasswordReset(user.email, user.name, token);

      return success(res, { message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      const user = await User.findByResetToken(token);
      if (!user) return badRequest(res, 'Reset token is invalid or has expired');

      await User.updatePassword(user.id, password);

      return success(res, { message: 'Password updated successfully' });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return unauthorized(res);
      return success(res, { user });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { name, profile_picture, timezone, dark_mode } = req.body;
      const user = await User.update(req.user.id, { name, profile_picture, timezone, dark_mode });
      return success(res, { user });
    } catch (err) {
      next(err);
    }
  },

  async deleteAccount(req, res, next) {
    try {
      await User.delete(req.user.id);
      return success(res, { message: 'Account deleted' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
