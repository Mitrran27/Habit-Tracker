import { useState, useEffect, useRef } from 'react';
import { friendsAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import Spinner from '../components/common/Spinner';

// Format timestamp: DD/M/YYYY, HH:MM  (day first, then month, then year)
function formatMsgTime(isoString) {
  const d = new Date(isoString);
  const day   = d.getDate();
  const month = d.getMonth() + 1;
  const year  = d.getFullYear();
  const hh    = String(d.getHours()).padStart(2, '0');
  const mm    = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}, ${day}/${month}/${year}`;
}

// Group messages by date label (Today, Yesterday, DD/M/YYYY)
function getDateLabel(isoString) {
  const msgDate  = new Date(isoString);
  const today    = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const same = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (same(msgDate, today))     return 'Today';
  if (same(msgDate, yesterday)) return 'Yesterday';

  const d = msgDate.getDate();
  const m = msgDate.getMonth() + 1;
  const y = msgDate.getFullYear();
  return `${d}/${m}/${y}`;
}

// Group consecutive messages from same sender into bubbles
function groupMessages(messages) {
  const groups = [];
  let lastDate = null;

  for (const msg of messages) {
    const dateLabel = getDateLabel(msg.created_at);
    if (dateLabel !== lastDate) {
      groups.push({ type: 'date', label: dateLabel, key: `date-${msg.id}` });
      lastDate = dateLabel;
    }
    groups.push({ type: 'message', ...msg });
  }
  return groups;
}

export default function ChatPage({ friend, onBack }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  const load = async () => {
    try {
      const { data } = await friendsAPI.getMessages(friend.id);
      setMessages(data.data.messages ?? []);
    } catch {
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Poll for new messages every 5 seconds
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [friend.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput('');

    // Optimistic update
    const tempMsg = {
      id:          `temp-${Date.now()}`,
      sender_id:   user.id,
      receiver_id: friend.id,
      content,
      created_at:  new Date().toISOString(),
      sender_name: user.name,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await friendsAPI.sendMessage(friend.id, content);
      // Reload to get real ID and server timestamp
      await load();
    } catch {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setInput(content);
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const grouped = groupMessages(messages);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{ background: 'var(--surface-2)', border: 'none', color: 'var(--text)', width: 36, height: 36, borderRadius: 12, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          ←
        </button>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: 'white',
        }}>
          {friend.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{friend.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🔥 {friend.top_streak ?? 0}d streak</div>
        </div>
      </div>

      {/* Message list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👋</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              Start a conversation with {friend.name}!
            </div>
          </div>
        ) : (
          grouped.map((item) => {
            if (item.type === 'date') {
              return (
                <div key={item.key} style={{ textAlign: 'center', margin: '16px 0 8px' }}>
                  <span style={{
                    fontSize: 11, color: 'var(--text-dim)', fontWeight: 600,
                    background: 'var(--surface-2)', padding: '4px 12px',
                    borderRadius: 99, border: '1px solid var(--border)',
                  }}>
                    {item.label}
                  </span>
                </div>
              );
            }

            const isMe = item.sender_id === user?.id;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  marginBottom: 6,
                }}
              >
                <div style={{ maxWidth: '78%' }}>
                  <div style={{
                    padding: '9px 13px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMe ? 'var(--primary)' : 'var(--surface-2)',
                    color: isMe ? 'white' : 'var(--text)',
                    fontSize: 15,
                    lineHeight: 1.45,
                    border: isMe ? 'none' : '1px solid var(--border)',
                    wordBreak: 'break-word',
                  }}>
                    {item.content}
                  </div>
                  {/* Timestamp: [HH:MM, D/M/YYYY] Name */}
                  <div style={{
                    fontSize: 10, color: 'var(--text-dim)',
                    marginTop: 3,
                    textAlign: isMe ? 'right' : 'left',
                    paddingLeft: isMe ? 0 : 4,
                    paddingRight: isMe ? 4 : 0,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    [{formatMsgTime(item.created_at)}] {item.sender_name}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'flex-end',
        padding: '10px 16px calc(10px + env(safe-area-inset-bottom))',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <textarea
          ref={inputRef}
          rows={1}
          className="input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            // Auto-grow textarea
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{
            flex: 1, resize: 'none', overflowY: 'auto',
            maxHeight: 120, lineHeight: 1.5,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: input.trim() && !sending ? 'var(--primary)' : 'var(--surface-2)',
            border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0, transition: 'background 0.2s',
          }}
        >
          {sending ? '…' : '➤'}
        </button>
      </div>
    </div>
  );
}
