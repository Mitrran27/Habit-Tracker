export default function BarChart({ data = [], labelKey = 'date', valueKey = 'completed', color = '#6C63FF', height = 120 }) {
  const max = Math.max(...data.map((d) => +d[valueKey]), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {data.map((item, i) => {
        const barH = Math.max(Math.round((+item[valueKey] / max) * (height - 24)), 4);
        const isLast = i === data.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: '100%', height: barH,
              background: isLast ? color : color + '55',
              borderRadius: '5px 5px 0 0',
              transition: 'height 0.4s cubic-bezier(0.16,1,0.3,1)',
            }} />
            <span style={{ fontSize: 9, color: isLast ? 'var(--text)' : 'var(--text-dim)', whiteSpace: 'nowrap' }}>
              {item[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
