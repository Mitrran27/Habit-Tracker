import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    const result = await login(form);
    if (result.success) navigate('/');
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎯</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>HabitTracker</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Build the life you want, one habit at a time.</div>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          className="input"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: 13, padding: '10px 14px', background: '#FF6B6B11', borderRadius: 10 }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || !form.email || !form.password}
          style={{ marginTop: 4 }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div style={{ textAlign: 'right' }}>
          <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: 13 }}>Forgot password?</Link>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 32, color: 'var(--text-muted)', fontSize: 14 }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign Up</Link>
      </div>

      {/* Dev shortcut */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button
          onClick={() => setForm({ email: 'alex@example.com', password: 'password123' })}
          style={{ color: 'var(--text-dim)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Use demo account
        </button>
      </div>
    </div>
  );
}
