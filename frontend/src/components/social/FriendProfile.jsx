import { useState, useEffect } from 'react';
import { friendsAPI } from '../../services/api';
import CircleProgress from '../common/CircleProgress';
import Spinner from '../common/Spinner';
import { getCategoryConfig, getDifficultyConfig, pct } from '../../utils/helpers';

export default function FriendProfile({ friend, onBack, onChat }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    friendsAPI.getProfile(friend.id)
      .then(({ data }) => { setProfile(data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [friend.id]);

  const completed = profile?.habits?.filter((h) => h.completed_today).length ?? 0;
  const total     = profile?.habits?.length ?? 0;
  const todayPct  = pct(completed, total);
  const isOnline  = profile?.user?.is_online ?? friend?.is_online ?? 0;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
        <button
          onClick={onBack}
          style={{ background: 'var(--surface-2)', border: 'none', color: 'var(--text)', width: 36, height: 36, borderRadius: 12, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ←
        </button>
        <span style={{ fontSize: 17, fontWeight: 700 }}>{friend.name}'s Profile</span>
        <button
          onClick={onChat}
          style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          💬 Chat
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size={36} /></div>
      ) : !profile ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Could not load profile</div>
      ) : (
        <div style={{ padding: '0 20px' }}>
          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            {/* Avatar with online dot */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
              <div style={{
                width: 76, height: 76, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 700, color: 'white',
              }}>
                {friend.name?.charAt(0).toUpperCase()}
              </div>
              {isOnline ? (
                <div style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#43D9A2', border: '2.5px solid var(--bg)',
                }} />
              ) : null}
            </div>

            <div style={{ fontSize: 20, fontWeight: 800 }}>{profile.user.name}</div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 }}>
              {isOnline ? (
                <span style={{ color: '#43D9A2', fontSize: 13, fontWeight: 600 }}>● Online</span>
              ) : (
                <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>● Offline</span>
              )}
              <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>·</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Since {new Date(profile.user.created_at).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Today's progress ring */}
          <div className="card" style={{ padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
            <CircleProgress value={todayPct} size={80} stroke={7} color={todayPct === 100 ? '#43D9A2' : '#6C63FF'}>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: todayPct === 100 ? '#43D9A2' : 'var(--text)' }}>
                {todayPct}%
              </span>
            </CircleProgress>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Today's progress</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>
                {completed}<span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>/{total}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>habits done</div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Habits',       value: profile.stats.total_habits,       icon: '📋', color: 'var(--primary)' },
              { label: 'Best Streak',  value: `${profile.stats.best_streak}d`,  icon: '🏆', color: 'var(--gold)' },
              { label: 'Total Streak', value: `${profile.stats.total_streak}d`, icon: '🔥', color: 'var(--warning)' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Habits list */}
          {profile.habits.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Their Habits
              </div>
              {profile.habits.map((h) => {
                const diff     = getDifficultyConfig(h.difficulty);
                const progress = pct(h.current_streak, h.target_days);
                return (
                  <div key={`fh-${h.id}`} className="card" style={{ padding: 14, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 14, background: `${h.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {h.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: h.completed_today ? 'var(--text-muted)' : 'var(--text)', textDecoration: h.completed_today ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {h.name}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: diff.bg, color: diff.color, flexShrink: 0 }}>
                            {diff.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ height: 4, flex: 1 }}>
                            <div className="progress-fill" style={{ width: `${progress}%`, background: h.color }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                            {h.current_streak}d 🔥
                          </span>
                        </div>
                      </div>
                      {h.completed_today && (
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: h.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: 'white', fontSize: 12, fontWeight: 800 }}>✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
