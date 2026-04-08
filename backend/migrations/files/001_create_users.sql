-- 001_create_users.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100)        NOT NULL,
  email            VARCHAR(255)        NOT NULL UNIQUE,
  password_hash    TEXT                NOT NULL,
  profile_picture  TEXT,
  timezone         VARCHAR(50)         NOT NULL DEFAULT 'UTC',
  dark_mode        BOOLEAN             NOT NULL DEFAULT TRUE,
  reset_token      TEXT,
  reset_expires    TIMESTAMPTZ,
  created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
