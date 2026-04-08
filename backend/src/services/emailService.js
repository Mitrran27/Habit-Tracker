const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// ─── Gmail SMTP transport ─────────────────────────────────────────────────────
// Add these to your .env:
//   GMAIL_USER=yourgmail@gmail.com
//   GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx   ← 16-char App Password (not your real password)
//
// How to get a Gmail App Password:
//   1. Go to https://myaccount.google.com/security
//   2. Enable 2-Step Verification (required)
//   3. Search "App passwords" → create one → select "Mail" and your device
//   4. Copy the 16-character code into GMAIL_APP_PASSWORD in .env

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM     = process.env.GMAIL_USER || 'noreply@example.com';
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── RESEND (commented out — uncomment below to switch back) ──────────────────
// const { Resend } = require('resend');
// const resend = new Resend(process.env.RESEND_API_KEY);
// const FROM = process.env.EMAIL_FROM || 'HabitTracker <noreply@example.com>';
//
// To revert to Resend, comment out the nodemailer block above and uncomment these,
// then replace sendMail({ to, subject, html }) with:
//   resend.emails.send({ from: FROM, to, subject, html })
// ─────────────────────────────────────────────────────────────────────────────

const sendMail = ({ to, subject, html }) =>
  transporter.sendMail({ from: `HabitTracker <${FROM}>`, to, subject, html });

const emailService = {
  async sendPasswordReset(to, name, token) {
    const link = `${FRONTEND}/reset-password?token=${token}`;
    try {
      await sendMail({
        to,
        subject: '🔐 Reset your HabitTracker password',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
            <h2 style="color:#6C63FF">Reset your password</h2>
            <p>Hi ${name},</p>
            <p>Click the button below to reset your password. Link expires in <strong>1 hour</strong>.</p>
            <a href="${link}"
               style="display:inline-block;background:#6C63FF;color:#fff;padding:12px 28px;
                      border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
              Reset Password
            </a>
            <p style="color:#888;font-size:13px">If you didn't request this, ignore this email.</p>
          </div>`,
      });
      logger.info(`Password reset email sent to ${to}`);
    } catch (err) {
      logger.error('Failed to send password reset email:', err);
    }
  },

  async sendHabitReminder(to, userName, habitName, whyReason) {
    try {
      await sendMail({
        to,
        subject: `⏰ Don't forget: ${habitName}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
            <h2 style="color:#6C63FF">Habit reminder 🔔</h2>
            <p>Hey ${userName}!</p>
            <p>You haven't completed <strong>${habitName}</strong> yet today.</p>
            ${whyReason
              ? `<blockquote style="border-left:3px solid #6C63FF;padding-left:16px;color:#555;font-style:italic">
                   "${whyReason}"<br><small>— your reason for starting</small>
                 </blockquote>`
              : ''}
            <a href="${FRONTEND}"
               style="display:inline-block;background:#6C63FF;color:#fff;padding:12px 28px;
                      border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
              Open HabitTracker
            </a>
          </div>`,
      });
      logger.info(`Reminder sent to ${to} for: ${habitName}`);
    } catch (err) {
      logger.error(`Failed to send reminder to ${to}:`, err);
    }
  },

  async sendWeeklyReport(to, userName, stats) {
    try {
      await sendMail({
        to,
        subject: `📊 Your weekly HabitTracker report`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
            <h2 style="color:#6C63FF">Weekly report 📈</h2>
            <p>Hey ${userName}, here's how you did this week:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr style="background:#f5f5ff">
                <td style="padding:10px">✅ Completed</td>
                <td style="padding:10px;font-weight:700;text-align:right">${stats.completed}</td>
              </tr>
              <tr>
                <td style="padding:10px">🔥 Best streak</td>
                <td style="padding:10px;font-weight:700;text-align:right">${stats.bestStreak} days</td>
              </tr>
              <tr style="background:#f5f5ff">
                <td style="padding:10px">📊 Completion rate</td>
                <td style="padding:10px;font-weight:700;text-align:right">${stats.rate}%</td>
              </tr>
            </table>
            <a href="${FRONTEND}/stats"
               style="display:inline-block;background:#6C63FF;color:#fff;padding:12px 28px;
                      border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
              View Full Report
            </a>
          </div>`,
      });
      logger.info(`Weekly report sent to ${to}`);
    } catch (err) {
      logger.error(`Failed to send weekly report to ${to}:`, err);
    }
  },
};

module.exports = emailService;
