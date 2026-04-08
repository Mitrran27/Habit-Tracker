-- 003_create_habit_logs.sql
CREATE TYPE log_status AS ENUM ('completed', 'missed', 'skipped');
CREATE TYPE mood_type  AS ENUM ('happy', 'normal', 'sad', 'tired', 'stressed');

CREATE TABLE habit_logs (
  id                  SERIAL      PRIMARY KEY,
  habit_id            INTEGER     NOT NULL REFERENCES habits (id) ON DELETE CASCADE,
  date                DATE        NOT NULL DEFAULT CURRENT_DATE,
  status              log_status  NOT NULL DEFAULT 'completed',
  time_spent_minutes  INTEGER     CHECK (time_spent_minutes > 0),
  notes               TEXT,
  mood                mood_type,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_habit_log_per_day UNIQUE (habit_id, date)
);

CREATE INDEX idx_habit_logs_habit_id   ON habit_logs (habit_id);
CREATE INDEX idx_habit_logs_date       ON habit_logs (date);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs (habit_id, date DESC);
CREATE INDEX idx_habit_logs_mood       ON habit_logs (mood) WHERE mood IS NOT NULL;
