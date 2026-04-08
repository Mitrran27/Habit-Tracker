import { useState, useEffect } from 'react';
import CircleProgress from '../common/CircleProgress';
import { habitsAPI } from '../../services/api';
import { getCategoryConfig, getDifficultyConfig, pct, formatTime } from '../../utils/helpers';
import { WEEK_DAYS } from '../../utils/constants';

export default function HabitDetail({ habit, onClose, onEdit, onDelete, onToggle }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    habitsAPI.logs(habit.id, { limit: 7 }).then(({ data }) => setLogs(data.data.logs));
  }, [habit.id]);

  const progress = pct(habit.current_streak, habit.target_days);
  const cat  = getCategoryConfig(habit.category);
  const diff = getDifficultyConfig(habit.difficulty);

  // Build last-7-days completion map
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split('T')[0];
    const log = logs.find((l) => l.date?.startsWith(iso));
    return { day: WEEK_DAYS[(d.getDay() + 6) % 7], completed: log?.status === 'completed' };
  });

  return (
    <div className="fade-in" style={{ padding: '0 20px 20px' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 20px' }}>
        <button className="btn-icon" onClick={onClose} style={{ fontSize: 18 }}>←</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onEdit(habit)}
            style={{ background: 'transparent', border: '1.5px solid var(--primary)', color: 'var(--primary)', padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Edit
          </button>
          <button
            onClick={() => { onDelete(habit.id); onClose(); }}
            style={{ background: '#FF6B6B22', border: 'none', color: 'var(--danger)', padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 76, height: 76, borderRadius: 24, background: `${habit.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, margin: '0 auto 14px' }}>
          {habit.icon}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{habit.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ color: cat.color, fontSize: 13 }}>{cat.icon} {cat.label}</span>
          <span style={{ color: 'var(--text-dim)' }}>·</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{habit.type}</span>
          {habit.reminder_time && (
            <>
              <span style={{ color: 'var(--text-dim)' }}>·</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>⏰ {formatTime(habit.reminder_time)}</span>
            </>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Current',  value: `${habit.current_streak}🔥`, color: 'var(--warning)' },
          { label: 'Best',     value: `${habit.best_streak}🏆`,    color: 'var(--gold)' },
          { label: 'Progress', value: `${progress}%`,              color: habit.color },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress ring */}
      <div className="card" style={{ padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
        <CircleProgress value={progress} size={80} stroke={7} color={habit.color}>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: habit.color }}>
            {progress}%
          </span>
        </CircleProgress>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
            {habit.current_streak} of {habit.target_days} days
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {habit.target_days - habit.current_streak > 0
              ? `${habit.target_days - habit.current_streak} days to go`
              : '🎉 Target reached!'}
          </div>
          <span className="badge" style={{ background: diff.bg, color: diff.color, marginTop: 8 }}>
            {diff.label}
          </span>
        </div>
      </div>

      {/* Last 7 days */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14 }}>Last 7 Days</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {last7.map(({ day, completed }, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: completed ? habit.color : 'var(--surface-2)',
                border: completed ? 'none' : '1.5px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 6px',
              }}>
                {completed && <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Why card */}
      {habit.why_reason && (
        <div className="card" style={{ padding: 16, marginBottom: 20, borderLeft: `3px solid ${habit.color}` }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Your Why ✨
          </div>
          <div style={{ fontSize: 15, fontStyle: 'italic', lineHeight: 1.6 }}>{habit.why_reason}</div>
        </div>
      )}

      {/* CTA */}
      <button
        className="btn"
        onClick={() => onToggle(habit.id, !habit.completed_today)}
        style={{
          width: '100%',
          background: habit.completed_today
            ? 'transparent'
            : `linear-gradient(135deg, ${habit.color}, ${habit.color}CC)`,
          border: habit.completed_today ? `1.5px solid ${habit.color}` : 'none',
          color: habit.completed_today ? habit.color : 'white',
          borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 700,
        }}
      >
        {habit.completed_today ? '✓ Completed Today!' : 'Mark as Complete ✓'}
      </button>
    </div>
  );
}
