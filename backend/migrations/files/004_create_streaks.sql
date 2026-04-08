-- 004_create_streaks.sql
CREATE TABLE streaks (
  id              SERIAL      PRIMARY KEY,
  habit_id        INTEGER     NOT NULL UNIQUE REFERENCES habits (id) ON DELETE CASCADE,
  current_streak  INTEGER     NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  best_streak     INTEGER     NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
  freeze_count    INTEGER     NOT NULL DEFAULT 0 CHECK (freeze_count >= 0),
  last_check_in   DATE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_streaks_habit_id ON streaks (habit_id);

CREATE TABLE streak_freezes (
  id          SERIAL      PRIMARY KEY,
  habit_id    INTEGER     NOT NULL REFERENCES habits (id) ON DELETE CASCADE,
  used_on     DATE        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
