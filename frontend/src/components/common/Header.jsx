export default function Header({ title, right, back, onBack }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px 8px',
    }}>
      {back ? (
        <button className="btn-icon" onClick={onBack} style={{ fontSize: 18 }}>←</button>
      ) : (
        <div style={{ width: 36 }} />
      )}
      <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>{title}</span>
      <div>{right ?? <div style={{ width: 36 }} />}</div>
    </div>
  );
}
