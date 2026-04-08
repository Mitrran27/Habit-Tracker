export default function Spinner({ size = 24, color = '#6C63FF' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `3px solid ${color}33`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}
