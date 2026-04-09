-- 011_add_online_status.sql
-- Tracks when a user was last seen so we can show online/offline status.
-- A user is considered "online" if last_seen is within the last 2 minutes.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

-- Index for fast "who is online?" queries
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users (last_seen);
