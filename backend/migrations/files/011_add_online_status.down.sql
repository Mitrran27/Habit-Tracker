-- 011_add_online_status.down.sql
ALTER TABLE users DROP COLUMN IF EXISTS last_seen;
DROP INDEX IF EXISTS idx_users_last_seen;
