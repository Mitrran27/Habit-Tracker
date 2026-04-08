import { getDifficultyConfig, pct } from '../../utils/helpers';

export default function HabitCard({ habit, onToggle, onPress }) {
  const diff = getDifficultyConfig(habit.difficulty);
  const progress = pct(habit.current_streak, habit.target_days);

  return (
    <div
      className="card slide-up"
      style={{ padding: 16, marginBottom: 12, cursor: 'pointer' }}
      onClick={onPress}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Check circle */}
        <div
          onClick={(e) => { e.stopPropagation(); onToggle(habit.id, !habit.completed_today); }}
          style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            border: `2px solid ${habit.completed_today ? habit.color : 'var(--border-light)'}`,
            background: habit.completed_today ? habit.color : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {habit.completed_today && (
            <span style={{ color: 'white', fontSize: 13, fontWeight: 800 }}>✓</span>
          )}
        </div>

        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: `${habit.color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>
          {habit.icon}
        </div>

        {/* Name + progress */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{
              fontWeight: 600, fontSize: 15,
              color: habit.completed_today ? 'var(--text-muted)' : 'var(--text)',
              textDecoration: habit.completed_today ? 'line-through' : 'none',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {habit.name}
            </span>
            <span className="badge" style={{ background: diff.bg, color: diff.color, flexShrink: 0 }}>
              {diff.label}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="progress-bar" style={{ height: 5, flex: 1 }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: habit.color }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
              {habit.current_streak}/{habit.target_days}d
            </span>
          </div>
        </div>

        {/* Streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <span style={{ fontSize: 16 }} className="pulse">🔥</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>
            {habit.current_streak}
          </span>
        </div>
      </div>
    </div>
  );
}
