-- 002_create_habits.sql
CREATE TYPE habit_type       AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE habit_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE habit_category   AS ENUM (
  'health', 'fitness', 'study',
  'productivity', 'finance', 'mental', 'personal'
);

CREATE TABLE habits (
  id              SERIAL           PRIMARY KEY,
  user_id         INTEGER          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name            VARCHAR(100)     NOT NULL,
  description     TEXT,
  type            habit_type       NOT NULL DEFAULT 'daily',
  category        habit_category   NOT NULL DEFAULT 'personal',
  difficulty      habit_difficulty NOT NULL DEFAULT 'medium',
  reminder_time   TIME,
  start_date      DATE             NOT NULL DEFAULT CURRENT_DATE,
  target_days     INTEGER          NOT NULL DEFAULT 30 CHECK (target_days > 0),
  color           VARCHAR(7)       NOT NULL DEFAULT '#6C63FF',
  icon            VARCHAR(10),
  why_reason      TEXT,
  track_time      BOOLEAN          NOT NULL DEFAULT FALSE,
  bad_habit       BOOLEAN          NOT NULL DEFAULT FALSE,
  archived        BOOLEAN          NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_habits_user_id      ON habits (user_id);
CREATE INDEX idx_habits_user_active  ON habits (user_id) WHERE archived = FALSE;
CREATE INDEX idx_habits_reminder     ON habits (reminder_time) WHERE archived = FALSE AND reminder_time IS NOT NULL;

CREATE TRIGGER trg_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
