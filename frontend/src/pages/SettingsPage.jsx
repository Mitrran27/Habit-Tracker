import { useState } from 'react';
import Header from '../components/common/Header';
import Toggle from '../components/common/Toggle';
import useAuthStore from '../store/authStore';
import { achievementsAPI } from '../services/api';
import { showToast } from '../components/common/Toast';

export default function SettingsPage({ onBack }) {
  const { user, logout, updateProfile } = useAuthStore();
  const [notifs, setNotifs]     = useState(true);
  const [emailRem, setEmailRem] = useState(true);
  const [achievements, setAch]  = useState(null);

  const loadAchievements = async () => {
    const { data } = await achievementsAPI.earned();
    setAch(data.data.achievements);
  };

  const Section = ({ label }) => (
    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, padding: '0 4px', marginTop: 20 }}>
      {label}
    </div>
  );

  const SettingRow = ({ icon, label, sub, right }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
        <div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
        </div>
      </div>
      <div>{right}</div>
    </div>
  );

  return (
    <div className="page">
      <Header title="Settings" back onBack={onBack} />
      <div style={{ padding: '0 20px' }}>

        {/* Profile card */}
        <div className="card" style={{ marginBottom: 4 }}>
          <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 58, height: 58, borderRadius: 18, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
            }}>
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: 18, objectFit: 'cover' }} />
              ) : '👤'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <div className="divider" />
          <div style={{ padding: '10px 16px 16px' }}>
            <button style={{ background: 'transparent', border: '1.5px solid var(--primary)', color: 'var(--primary)', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Edit Profile
            </button>
          </div>
        </div>

        <Section label="Notifications" />
        <div className="card" style={{ marginBottom: 4 }}>
          <SettingRow label="Push Notifications" sub="Get reminders on your device" right={<Toggle value={notifs} onChange={setNotifs} />} />
          <div className="divider" />
          <SettingRow label="Email Reminders"    sub="Daily habit email digest"    right={<Toggle value={emailRem} onChange={setEmailRem} />} />
        </div>

        <Section label="Achievements" />
        <div className="card" style={{ marginBottom: 4 }}>
          <div style={{ padding: 16 }}>
            {achievements === null ? (
              <button
                onClick={loadAchievements}
                style={{ color: 'var(--primary)', background: 'none', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                View my achievements →
              </button>
            ) : achievements.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No achievements earned yet. Keep going! 💪</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {achievements.map((a) => (
                  <div key={a.id} title={a.description} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '10px 14px', borderRadius: 14, background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: 26 }}>{a.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{a.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Section label="Data" />
        <div className="card" style={{ marginBottom: 4 }}>
          {[
            { icon: '📄', label: 'Export to PDF', action: () => showToast('Coming soon!', 'info') },
            { icon: '📊', label: 'Export to CSV', action: () => showToast('Coming soon!', 'info') },
          ].map((item, i, arr) => (
            <div key={item.label}>
              <div
                onClick={item.action}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>›</span>
              </div>
              {i < arr.length - 1 && <div className="divider" />}
            </div>
          ))}
        </div>

        <Section label="Account" />
        <button
          onClick={() => { logout(); }}
          style={{ width: '100%', padding: 14, borderRadius: 14, marginBottom: 12, background: '#FF6B6B22', border: '1px solid #FF6B6B44', color: 'var(--danger)', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
