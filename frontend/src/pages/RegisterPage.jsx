import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    const result = await register(form);
    if (result.success) navigate('/');
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🌱</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Create Account</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Start your habit journey today.</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input className="input" placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <input className="input" type="email" placeholder="Email address" value={form.email} onChange={(e) => set('email', e.target.value)} />
        <input className="input" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => set('password', e.target.value)} />

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: 13, padding: '10px 14px', background: '#FF6B6B11', borderRadius: 10 }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || !form.name || !form.email || form.password.length < 6}
          style={{ marginTop: 4 }}
        >
          {loading ? 'Creating account...' : 'Create Account 🚀'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 32, color: 'var(--text-muted)', fontSize: 14 }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
      </div>
    </div>
  );
}
