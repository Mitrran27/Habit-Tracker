import { useState, useEffect, useCallback } from 'react';

let _showToast = null;

export function showToast(message, type = 'success') {
  if (_showToast) _showToast(message, type);
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  useEffect(() => { _showToast = addToast; return () => { _showToast = null; }; }, [addToast]);

  const colors = { success: '#43D9A2', error: '#FF6B6B', info: '#6C63FF', warning: '#FFB347' };

  return (
    <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8, width: '90%', maxWidth: 390 }}>
      {toasts.map((t) => (
        <div key={t.id} className="slide-up" style={{
          background: 'var(--surface-2)', border: `1px solid ${colors[t.type] || colors.info}44`,
          borderLeft: `3px solid ${colors[t.type] || colors.info}`,
          borderRadius: 'var(--radius-md)', padding: '12px 16px',
          fontSize: 14, fontWeight: 500, color: 'var(--text)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
