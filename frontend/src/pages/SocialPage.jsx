import { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { friendsAPI } from '../services/api';
import { showToast } from '../components/common/Toast';
import useAuthStore from '../store/authStore';
import FriendProfile from '../components/social/FriendProfile';

const TABS = ['Friends', 'Leaderboard'];

// Green dot for online, nothing for offline
const OnlineDot = ({ isOnline }) =>
  isOnline ? (
    <div style={{
      width: 10, height: 10, borderRadius: '50%',
      background: '#43D9A2',
      border: '2px solid var(--surface)',
      position: 'absolute', bottom: 0, right: 0,
    }} />
  ) : null;

// Avatar with optional online indicator
const Avatar = ({ name, size = 42, isOnline = 0 }) => (
  <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: 'white',
    }}>
      {name?.charAt(0).toUpperCase()}
    </div>
    <OnlineDot isOnline={isOnline} />
  </div>
);

// onOpenChat is passed from App.jsx so the chat renders as a proper fixed overlay
export default function SocialPage({ onOpenChat }) {
  const { user } = useAuthStore();
  const [activeTab,   setActiveTab]   = useState('Friends');
  const [friends,     setFriends]     = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [emailInput,  setEmailInput]  = useState('');
  const [adding,      setAdding]      = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewFriend,  setViewFriend]  = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [fRes, lRes] = await Promise.all([
        friendsAPI.list(),
        friendsAPI.leaderboard(),
      ]);
      setFriends(fRes.data.data.friends ?? []);
      setLeaderboard(lRes.data.data.leaderboard ?? []);
    } catch {
      showToast('Failed to load friends', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!emailInput.trim()) return;
    setAdding(true);
    try {
      await friendsAPI.sendRequest({ email: emailInput.trim() });
      showToast('Friend request sent! 🎉', 'success');
      setEmailInput('');
      setShowAddForm(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send request', 'error');
    }
    setAdding(false);
  };

  const handleAccept = async (requesterId) => {
    try {
      await friendsAPI.accept({ requesterId });
      showToast('Friend added! 🤝', 'success');
      load();
    } catch {
      showToast('Failed to accept', 'error');
    }
  };

  const handleRemove = async (friendId) => {
    try {
      await friendsAPI.remove(friendId);
      showToast('Friend removed', 'info');
      load();
    } catch {
      showToast('Failed to remove', 'error');
    }
  };

  const accepted = friends.filter((f) => f.status === 'accepted');
  const pending  = friends.filter((f) => f.status === 'pending' && f.direction === 'received');
  const sent     = friends.filter((f) => f.status === 'pending' && f.direction === 'sent');

  // ── FriendProfile sub-view (rendered in-page, not as overlay) ────────────
  if (viewFriend) {
    return (
      <FriendProfile
        friend={viewFriend}
        onBack={() => setViewFriend(null)}
        onChat={() => {
          setViewFriend(null);
          onOpenChat(viewFriend);
        }}
      />
    );
  }

  // ── Friend card ──────────────────────────────────────────────
  const FriendCard = ({ f, showActions = true }) => (
    <div
      className="card"
      style={{ padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, cursor: f.status === 'accepted' ? 'pointer' : 'default' }}
      onClick={() => f.status === 'accepted' && setViewFriend(f)}
    >
      <Avatar name={f.name} isOnline={f.is_online} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {f.name}
          </span>
          {f.is_online ? (
            <span style={{ fontSize: 11, color: '#43D9A2', fontWeight: 600, flexShrink: 0 }}>● Online</span>
          ) : null}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.email}</div>
        {f.status === 'accepted' && (
          <div style={{ fontSize: 12, color: 'var(--warning)', marginTop: 2 }}>🔥 {f.top_streak}d streak</div>
        )}
      </div>

      {showActions && f.status === 'accepted' && (
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenChat(f); }}
            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            💬
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleRemove(f.id); }}
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 10px', fontSize: 13, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}
      {showActions && f.direction === 'received' && f.status === 'pending' && (
        <button
          onClick={(e) => { e.stopPropagation(); handleAccept(f.id); }}
          style={{ background: 'var(--success)', color: 'white', border: 'none', borderRadius: 10, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
        >
          Accept
        </button>
      )}
      {f.direction === 'sent' && f.status === 'pending' && (
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic', flexShrink: 0 }}>Pending</span>
      )}
    </div>
  );

  return (
    <div className="page">
      <Header
        title="Social"
        right={
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ background: 'var(--primary)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: 12, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            +
          </button>
        }
      />

      {/* Add friend form */}
      {showAddForm && (
        <div style={{ padding: '0 20px 16px' }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.7 }}>Add Friend by Email</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="friend@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                style={{ flex: 1 }}
              />
              <button
                onClick={handleAdd}
                disabled={adding || !emailInput.trim()}
                style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 12, padding: '0 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: adding ? 0.6 : 1, flexShrink: 0 }}
              >
                {adding ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8 }}>
        {TABS.map((t) => (
          <button
            key={t}
            className="chip"
            onClick={() => setActiveTab(t)}
            style={{
              background: activeTab === t ? 'var(--primary)' : 'transparent',
              borderColor: activeTab === t ? 'var(--primary)' : 'var(--border)',
              color: activeTab === t ? 'white' : 'var(--text-muted)',
            }}
          >
            {t === 'Leaderboard' ? '🏆 ' : '👥 '}{t}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
        ) : activeTab === 'Friends' ? (
          <>
            {pending.length > 0 && (
              <>
                <div style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>
                  Requests ({pending.length})
                </div>
                {pending.map((f) => <FriendCard key={`pending-${f.id}`} f={f} />)}
                <div style={{ height: 16 }} />
              </>
            )}

            {accepted.length > 0 ? (
              <>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>
                  Friends ({accepted.length})
                </div>
                {accepted.map((f) => <FriendCard key={`friend-${f.id}`} f={f} />)}
              </>
            ) : (
              <EmptyState
                icon="👥"
                title="No friends yet"
                subtitle="Add friends by their email to see their habits and chat"
                action="Add Friend"
                onAction={() => setShowAddForm(true)}
              />
            )}

            {sent.length > 0 && (
              <>
                <div style={{ height: 16 }} />
                <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>
                  Sent Requests
                </div>
                {sent.map((f) => <FriendCard key={`sent-${f.id}`} f={f} showActions={false} />)}
              </>
            )}
          </>
        ) : (
          leaderboard.length === 0 ? (
            <EmptyState icon="🏆" title="No leaderboard yet" subtitle="Add friends to compare streaks" />
          ) : (
            <>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 12 }}>
                Streak Rankings
              </div>
              {leaderboard.map((entry, i) => {
                const isMe = entry.id === user?.id;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div
                    key={`lb-${entry.id}`}
                    className="card"
                    style={{
                      padding: '14px 16px', marginBottom: 10,
                      borderLeft: isMe ? '3px solid var(--primary)' : undefined,
                      background: isMe ? 'var(--surface-2)' : undefined,
                      display: 'flex', alignItems: 'center', gap: 14,
                      cursor: !isMe ? 'pointer' : 'default',
                    }}
                    onClick={() => !isMe && setViewFriend(entry)}
                  >
                    <div style={{ fontSize: 22, width: 28, textAlign: 'center', flexShrink: 0 }}>
                      {medals[i] ?? <span style={{ fontSize: 14, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>#{i + 1}</span>}
                    </div>
                    <Avatar name={entry.name} size={38} isOnline={entry.is_online} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {entry.name}
                        {isMe && <span style={{ fontSize: 12, color: 'var(--primary)' }}>(You)</span>}
                        {entry.is_online ? <span style={{ fontSize: 11, color: '#43D9A2', fontWeight: 600 }}>● Online</span> : null}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Best: {entry.best_streak}d 🏆</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>
                        {entry.total_streak}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>total days</div>
                    </div>
                  </div>
                );
              })}
            </>
          )
        )}
      </div>
    </div>
  );
}
