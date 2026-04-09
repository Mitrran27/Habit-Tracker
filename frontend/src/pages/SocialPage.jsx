import { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { friendsAPI } from '../services/api';
import { showToast } from '../components/common/Toast';
import useAuthStore from '../store/authStore';
import FriendProfile from '../components/social/FriendProfile';
import ChatPage from './ChatPage';

const TABS = ['Friends', 'Leaderboard'];

export default function SocialPage() {
  const { user } = useAuthStore();
  const [activeTab,     setActiveTab]     = useState('Friends');
  const [friends,       setFriends]       = useState([]);
  const [leaderboard,   setLeaderboard]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [emailInput,    setEmailInput]    = useState('');
  const [adding,        setAdding]        = useState(false);
  const [showAddForm,   setShowAddForm]   = useState(false);
  const [viewFriend,    setViewFriend]    = useState(null); // friend profile overlay
  const [chatFriend,    setChatFriend]    = useState(null); // chat overlay

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
      showToast('Failed to accept request', 'error');
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

  const accepted  = friends.filter((f) => f.status === 'accepted');
  const pending   = friends.filter((f) => f.status === 'pending' && f.direction === 'received');
  const sent      = friends.filter((f) => f.status === 'pending' && f.direction === 'sent');

  // ── Sub-views ────────────────────────────────────────────────
  if (chatFriend) {
    return <ChatPage friend={chatFriend} onBack={() => setChatFriend(null)} />;
  }

  if (viewFriend) {
    return <FriendProfile friend={viewFriend} onBack={() => setViewFriend(null)} onChat={() => { setChatFriend(viewFriend); setViewFriend(null); }} />;
  }

  // ── Avatar ───────────────────────────────────────────────────
  const Avatar = ({ name, size = 42 }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: 'white',
    }}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );

  // ── Friend card ──────────────────────────────────────────────
  const FriendCard = ({ f, showActions = true }) => (
    <div className="card" style={{ padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
      onClick={() => f.status === 'accepted' && setViewFriend(f)}
    >
      <Avatar name={f.name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.email}</div>
        {f.status === 'accepted' && (
          <div style={{ fontSize: 12, color: 'var(--warning)', marginTop: 2 }}>🔥 {f.top_streak}d streak</div>
        )}
      </div>
      {showActions && f.status === 'accepted' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setChatFriend(f); }}
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
          style={{ background: 'var(--success)', color: 'white', border: 'none', borderRadius: 10, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Accept
        </button>
      )}
      {f.direction === 'sent' && f.status === 'pending' && (
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>Pending</span>
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
            {/* Pending requests received */}
            {pending.length > 0 && (
              <>
                <div style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>
                  Requests ({pending.length})
                </div>
                {pending.map((f) => <FriendCard key={`pending-${f.id}`} f={f} />)}
                <div style={{ height: 16 }} />
              </>
            )}

            {/* Accepted friends */}
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

            {/* Sent requests */}
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
          // ── Leaderboard tab ──────────────────────────────────
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
                    <div style={{ fontSize: 22, width: 28, textAlign: 'center' }}>
                      {medals[i] ?? <span style={{ fontSize: 14, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>#{i + 1}</span>}
                    </div>
                    <Avatar name={entry.name} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        {entry.name} {isMe && <span style={{ fontSize: 12, color: 'var(--primary)' }}>(You)</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Best: {entry.best_streak}d 🏆</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
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
