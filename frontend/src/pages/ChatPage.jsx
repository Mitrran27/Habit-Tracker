import { useState, useEffect, useRef } from 'react';
import { friendsAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import Spinner from '../components/common/Spinner';

// Format: HH:MM, D/M/YYYY  (day first, then month, then year)
function formatMsgTime(isoString) {
  const d     = new Date(isoString);
  const hh    = String(d.getHours()).padStart(2, '0');
  const mm    = String(d.getMinutes()).padStart(2, '0');
  const day   = d.getDate();
  const month = d.getMonth() + 1;
  const year  = d.getFullYear();
  return `${hh}:${mm}, ${day}/${month}/${year}`;
}

function getDateLabel(isoString) {
  const msgDate   = new Date(isoString);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const same = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (same(msgDate, today))     return 'Today';
  if (same(msgDate, yesterday)) return 'Yesterday';

  return `${msgDate.getDate()}/${msgDate.getMonth() + 1}/${msgDate.getFullYear()}`;
}

function groupMessages(messages) {
  const groups  = [];
  let lastDate  = null;
  for (const msg of messages) {
    const label = getDateLabel(msg.created_at);
    if (label !== lastDate) {
      groups.push({ type: 'date', label, key: `date-${msg.id}` });
      lastDate = label;
    }
    groups.push({ type: 'message', ...msg });
  }
  return groups;
}

// Online dot
const OnlineDot = ({ isOnline }) =>
  isOnline ? (
    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#43D9A2', border: '2px solid var(--surface)', flexShrink: 0 }} />
  ) : null;

export default function ChatPage({ friend, onBack }) {
  const { user }                    = useAuthStore();
  const [messages, setMessages]     = useState([]);
  const [input,    setInput]        = useState('');
  const [loading,  setLoading]      = useState(true);
  const [sending,  setSending]      = useState(false);
  const [isOnline, setIsOnline]     = useState(friend?.is_online ?? 0);
  const bottomRef                   = useRef(null);
  const textareaRef                 = useRef(null);
  const pollRef                     = useRef(null);

  const load = async () => {
    try {
      const { data } = await friendsAPI.getMessages(friend.id);
      const msgs = data.data.messages ?? [];
      setMessages(msgs);
      // Pick up fresh online status from last message metadata if available
      if (data.data.is_online !== undefined) setIsOnline(data.data.is_online);
    } catch {
      // silently keep existing messages
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 5000);
    return () => clearInterval(pollRef.current);
  }, [friend.id]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Optimistic message
    const tempId  = `temp-${Date.now()}`;
    const tempMsg = {
      id:          tempId,
      sender_id:   user?.id,
      receiver_id: friend.id,
      content,
      created_at:  new Date().toISOString(),
      sender_name: user?.name ?? 'You',
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await friendsAPI.sendMessage(friend.id, content);
      await load();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(content);
    }
    setSending(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    // Auto-grow
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 130) + 'px';
  };

  const grouped = groupMessages(messages);

  return (
    /*
     * This component is rendered inside a `position: fixed` container in App.jsx
     * that already takes up the full viewport. We just fill it with flex column.
     */
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)',
    }}>

      {/* ── Header ────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'var(--surface-2)', border: 'none', color: 'var(--text)',
            width: 36, height: 36, borderRadius: 12, fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          ←
        </button>

        {/* Avatar with online dot */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 700, color: 'white',
          }}>
            {friend.name?.charAt(0).toUpperCase()}
          </div>
          {isOnline ? (
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 11, height: 11, borderRadius: '50%',
              background: '#43D9A2', border: '2px solid var(--surface)',
            }} />
          ) : null}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            {friend.name}
          </div>
          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
            {isOnline ? (
              <span style={{ color: '#43D9A2', fontWeight: 600 }}>● Online</span>
            ) : (
              <span style={{ color: 'var(--text-dim)' }}>Offline</span>
            )}
            <span style={{ color: 'var(--text-dim)' }}>· 🔥 {friend.top_streak ?? 0}d streak</span>
          </div>
        </div>
      </div>

      {/* ── Message list — scrollable middle section ───────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>👋</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              Say hi to {friend.name}!
            </div>
          </div>
        ) : (
          grouped.map((item) => {
            if (item.type === 'date') {
              return (
                <div key={item.key} style={{ textAlign: 'center', margin: '18px 0 10px' }}>
                  <span style={{
                    fontSize: 11, color: 'var(--text-dim)', fontWeight: 600,
                    background: 'var(--surface-2)', padding: '4px 14px',
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
                style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}
              >
                <div style={{ maxWidth: '78%' }}>
                  <div style={{
                    padding: '9px 14px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMe ? 'var(--primary)' : 'var(--surface-2)',
                    color: isMe ? 'white' : 'var(--text)',
                    fontSize: 15, lineHeight: 1.45,
                    border: isMe ? 'none' : '1px solid var(--border)',
                    wordBreak: 'break-word',
                    opacity: item.id?.toString().startsWith('temp-') ? 0.7 : 1,
                  }}>
                    {item.content}
                  </div>
                  <div style={{
                    fontSize: 10, color: 'var(--text-dim)', marginTop: 3,
                    textAlign: isMe ? 'right' : 'left',
                    paddingLeft: isMe ? 0 : 4, paddingRight: isMe ? 4 : 0,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    [{formatMsgTime(item.created_at)}] {item.sender_name}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} style={{ height: 4 }} />
      </div>

      {/* ── Input bar — fixed at bottom of the flex column ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 10,
        padding: '10px 16px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
        // Extra bottom padding on iOS for home-bar safe area
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
      }}>
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Type a message..."
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            background: 'var(--surface-2)',
            border: '1.5px solid var(--border)',
            borderRadius: 20,
            padding: '10px 16px',
            color: 'var(--text)',
            fontSize: 15,
            fontFamily: 'var(--font-sans)',
            resize: 'none',
            outline: 'none',
            lineHeight: 1.5,
            maxHeight: 130,
            overflowY: 'auto',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
          onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: input.trim() && !sending ? 'var(--primary)' : 'var(--surface-2)',
            border: 'none',
            cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
            transition: 'background 0.2s, transform 0.1s',
            color: input.trim() && !sending ? 'white' : 'var(--text-dim)',
          }}
          onMouseDown={(e) => { if (input.trim()) e.currentTarget.style.transform = 'scale(0.92)'; }}
          onMouseUp={(e)   => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {sending ? '…' : '➤'}
        </button>
      </div>
    </div>
  );
}
