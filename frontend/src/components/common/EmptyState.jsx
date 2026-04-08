export default function EmptyState({ icon = '🌱', title, subtitle, action, onAction }) {
  return (
    <div className="card" style={{ padding: 48, textAlign: 'center', margin: '0 20px' }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>{subtitle}</div>}
      {action && (
        <button className="btn btn-primary" onClick={onAction} style={{ width: 'auto', padding: '10px 24px' }}>
          {action}
        </button>
      )}
    </div>
  );
}
