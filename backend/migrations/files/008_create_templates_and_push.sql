-- 008_create_templates_and_push.sql

-- Habit templates (public library + user-created)
CREATE TABLE habit_templates (
  id           SERIAL         PRIMARY KEY,
  name         VARCHAR(100)   NOT NULL,
  description  TEXT,
  category     habit_category,
  habits       JSONB          NOT NULL,
  is_public    BOOLEAN        NOT NULL DEFAULT TRUE,
  created_by   INTEGER        REFERENCES users (id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Push notification device tokens
CREATE TABLE push_tokens (
  id          SERIAL      PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token       TEXT        NOT NULL,
  platform    VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_push_token UNIQUE (user_id, token)
);

CREATE INDEX idx_push_tokens_user ON push_tokens (user_id);

-- Seed public templates
INSERT INTO habit_templates (name, description, category, habits, is_public) VALUES
(
  'Morning Routine',
  'Start every day with intention',
  'health',
  '[
    {"name":"Drink Water",   "icon":"💧","color":"#60A5FA","type":"daily","difficulty":"easy"},
    {"name":"Meditate",      "icon":"🧘","color":"#A78BFA","type":"daily","difficulty":"medium"},
    {"name":"Exercise",      "icon":"💪","color":"#43D9A2","type":"daily","difficulty":"hard"},
    {"name":"Read 20 min",   "icon":"📚","color":"#6C63FF","type":"daily","difficulty":"easy"},
    {"name":"Cold Shower",   "icon":"🚿","color":"#60A5FA","type":"daily","difficulty":"hard"}
  ]',
  TRUE
),
(
  'Study Routine',
  'Build consistent learning habits',
  'study',
  '[
    {"name":"Read Textbook",      "icon":"📚","color":"#6C63FF","type":"daily","difficulty":"medium"},
    {"name":"Practice Problems",  "icon":"🖊️","color":"#A78BFA","type":"daily","difficulty":"hard"},
    {"name":"Review Notes",       "icon":"📝","color":"#43D9A2","type":"daily","difficulty":"easy"},
    {"name":"No Social Media",    "icon":"📵","color":"#FF6B6B","type":"daily","difficulty":"hard"}
  ]',
  TRUE
),
(
  'Fitness Routine',
  'Get stronger every single day',
  'fitness',
  '[
    {"name":"Workout",        "icon":"💪","color":"#FFB347","type":"daily","difficulty":"hard"},
    {"name":"Protein Intake", "icon":"🥗","color":"#43D9A2","type":"daily","difficulty":"easy"},
    {"name":"Stretch 10 min", "icon":"🧘","color":"#A78BFA","type":"daily","difficulty":"easy"},
    {"name":"Sleep 8 hours",  "icon":"😴","color":"#60A5FA","type":"daily","difficulty":"medium"}
  ]',
  TRUE
),
(
  'Productivity',
  'Do your most important work daily',
  'productivity',
  '[
    {"name":"Plan Your Day",      "icon":"🎯","color":"#6C63FF","type":"daily","difficulty":"easy"},
    {"name":"Deep Work 2h",       "icon":"⚡","color":"#FFB347","type":"daily","difficulty":"hard"},
    {"name":"No Phone Morning",   "icon":"📵","color":"#FF6B6B","type":"daily","difficulty":"medium"},
    {"name":"Review Goals",       "icon":"📊","color":"#43D9A2","type":"daily","difficulty":"easy"}
  ]',
  TRUE
);
