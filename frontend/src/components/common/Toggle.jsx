export default function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 28, borderRadius: 14,
        background: value ? '#6C63FF' : '#252336',
        cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: 'white', position: 'absolute',
        top: 3, left: value ? 23 : 3,
        transition: 'left 0.2s',
      }} />
    </div>
  );
}
