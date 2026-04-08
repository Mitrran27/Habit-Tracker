-- 007_create_achievements.sql
CREATE TABLE achievements (
  id           SERIAL       PRIMARY KEY,
  code         VARCHAR(50)  NOT NULL UNIQUE,
  title        VARCHAR(100) NOT NULL,
  description  TEXT,
  icon         VARCHAR(10),
  criteria     JSONB        NOT NULL
);

CREATE TABLE user_achievements (
  id              SERIAL      PRIMARY KEY,
  user_id         INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  achievement_id  INTEGER     NOT NULL REFERENCES achievements (id) ON DELETE CASCADE,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements (user_id);

-- Seed default achievements
INSERT INTO achievements (code, title, description, icon, criteria) VALUES
  ('first_habit',  'Getting Started',   'Created your first habit',              '🌱', '{"type":"habit_count","value":1}'),
  ('five_habits',  'Habit Collector',   'Track 5 habits simultaneously',         '⭐', '{"type":"habit_count","value":5}'),
  ('streak_7',     '7-Day Warrior',     'Maintain a 7-day streak on any habit',  '🔥', '{"type":"streak","value":7}'),
  ('streak_30',    '30-Day Champion',   '30-day streak — a whole month!',        '🏆', '{"type":"streak","value":30}'),
  ('streak_100',   '100-Day Legend',    '100 consecutive days. Incredible.',     '💎', '{"type":"streak","value":100}'),
  ('mood_week',    'Self-Aware',        'Log your mood for 7 days in a row',     '🧠', '{"type":"mood_streak","value":7}'),
  ('perfect_week', 'Perfect Week',      'Complete every habit for 7 days',       '✨', '{"type":"perfect_days","value":7}');
