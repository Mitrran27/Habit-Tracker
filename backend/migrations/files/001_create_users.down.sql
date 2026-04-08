-- 001_create_users.down.sql
DROP TRIGGER  IF EXISTS trg_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at();
DROP TABLE    IF EXISTS users;
