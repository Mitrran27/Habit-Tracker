-- 005_create_journal.sql
CREATE TABLE journal_entries (
  id          SERIAL      PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  mood        mood_type,
  date        DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journal_user_id ON journal_entries (user_id);
CREATE INDEX idx_journal_date    ON journal_entries (user_id, date DESC);
