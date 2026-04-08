-- 006_create_friends.sql
CREATE TYPE friend_status AS ENUM ('pending', 'accepted', 'blocked');

CREATE TABLE friends (
  id          SERIAL        PRIMARY KEY,
  user_id     INTEGER       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  friend_id   INTEGER       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status      friend_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_friend_pair  UNIQUE (user_id, friend_id),
  CONSTRAINT chk_not_self    CHECK  (user_id <> friend_id)
);

CREATE INDEX idx_friends_user_id   ON friends (user_id);
CREATE INDEX idx_friends_friend_id ON friends (friend_id);
CREATE INDEX idx_friends_status    ON friends (status);
