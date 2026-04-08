require('dotenv').config();
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const morgan  = require('morgan');

const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler   = require('./middleware/errorHandler');
const logger         = require('./utils/logger');

const app = express();

// ─── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// ─── Logging ─────────────────────────────────────────────────
app.use(morgan('dev', { stream: { write: (msg) => logger.http(msg.trim()) } }));

// ─── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate limiting ───────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/habits',       require('./routes/habits'));
app.use('/api/stats',        require('./routes/stats'));
app.use('/api/journal',      require('./routes/journal'));
app.use('/api/friends',      require('./routes/friends'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/reminders',    require('./routes/reminders'));

// ─── Health check ────────────────────────────────────────────
app.get('/health', (_, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date() })
);

// ─── 404 ─────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` })
);

// ─── Global error handler ────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => logger.info(`🚀 API running on port ${PORT} [${process.env.NODE_ENV}]`));

module.exports = app;
