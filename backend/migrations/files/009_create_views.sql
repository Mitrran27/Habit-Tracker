-- 009_create_views.sql

-- Daily dashboard: every habit with today's check-in status
CREATE OR REPLACE VIEW v_daily_dashboard AS
SELECT
  h.id,
  h.user_id,
  h.name,
  h.icon,
  h.color,
  h.category,
  h.type,
  h.difficulty,
  h.target_days,
  h.why_reason,
  h.track_time,
  h.bad_habit,
  s.current_streak,
  s.best_streak,
  s.freeze_count,
  l.status            AS today_status,
  l.mood              AS today_mood,
  l.time_spent_minutes AS today_time,
  l.notes             AS today_notes,
  ROUND(
    s.current_streak::numeric / NULLIF(h.target_days, 0) * 100, 1
  )                   AS progress_pct,
  (l.status = 'completed') AS completed_today
FROM habits h
LEFT JOIN streaks    s ON s.habit_id = h.id
LEFT JOIN habit_logs l ON l.habit_id = h.id AND l.date = CURRENT_DATE
WHERE h.archived = FALSE;

-- Weekly completion rate per user
CREATE OR REPLACE VIEW v_weekly_stats AS
SELECT
  h.user_id,
  COUNT(*)                                      AS total_logs,
  COUNT(*) FILTER (WHERE l.status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE l.status = 'missed')    AS missed,
  COUNT(*) FILTER (WHERE l.status = 'skipped')   AS skipped,
  ROUND(
    COUNT(*) FILTER (WHERE l.status = 'completed')::numeric
    / NULLIF(COUNT(*), 0) * 100, 1
  )                                              AS completion_rate
FROM habit_logs l
JOIN habits h ON h.id = l.habit_id
WHERE l.date >= NOW() - INTERVAL '7 days'
GROUP BY h.user_id;

-- Per-habit success rate (last 30 days)
CREATE OR REPLACE VIEW v_habit_success_rate AS
SELECT
  h.id         AS habit_id,
  h.user_id,
  h.name,
  h.icon,
  h.color,
  h.category,
  h.difficulty,
  s.current_streak,
  s.best_streak,
  COUNT(*)                                       AS total_logs,
  COUNT(*) FILTER (WHERE l.status = 'completed') AS completed,
  ROUND(
    COUNT(*) FILTER (WHERE l.status = 'completed')::numeric
    / NULLIF(COUNT(*), 0) * 100, 1
  )                                              AS success_rate
FROM habits h
LEFT JOIN streaks    s ON s.habit_id = h.id
LEFT JOIN habit_logs l ON l.habit_id = h.id
       AND l.date >= NOW() - INTERVAL '30 days'
WHERE h.archived = FALSE
GROUP BY h.id, h.user_id, h.name, h.icon, h.color, h.category, h.difficulty,
         s.current_streak, s.best_streak;
