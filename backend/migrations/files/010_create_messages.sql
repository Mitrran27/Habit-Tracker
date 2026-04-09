-- 010_create_messages.sql
-- Stores persistent chat messages between friends.
-- Format mirrors WhatsApp style: [HH:MM, D/M/YYYY] Sender: message

CREATE TABLE messages (
  id           SERIAL      PRIMARY KEY,
  sender_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  receiver_id  INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content      TEXT        NOT NULL CHECK (char_length(content) > 0),
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure sender and receiver are different people
  CONSTRAINT chk_no_self_message CHECK (sender_id <> receiver_id)
);

-- Fast lookup: all messages in a conversation between two users
CREATE INDEX idx_messages_conversation
  ON messages (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at);

-- Fast lookup: unread messages for a user
CREATE INDEX idx_messages_receiver_unread
  ON messages (receiver_id, read_at)
  WHERE read_at IS NULL;
