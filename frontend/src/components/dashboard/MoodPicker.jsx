import { MOODS } from '../../utils/constants';

export default function MoodPicker({ selected, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
        How are you feeling?
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            style={{
              flex: 1, padding: '10px 4px', borderRadius: 14, cursor: 'pointer',
              background: selected === m.id ? '#6C63FF22' : 'var(--surface)',
              border: selected === m.id ? '1.5px solid var(--primary)' : '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 22 }}>{m.emoji}</span>
            <span style={{ fontSize: 9, color: selected === m.id ? 'var(--primary)' : 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
              {m.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
