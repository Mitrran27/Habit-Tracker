import { useState } from 'react';
import Header from '../components/common/Header';
import BarChart from '../components/stats/BarChart';
import CircleProgress from '../components/common/CircleProgress';
import Spinner from '../components/common/Spinner';
import useStats from '../hooks/useStats';
import useHabitStore from '../store/habitStore';
import { CATEGORIES } from '../utils/constants';

export default function StatsPage() {
  const { habits } = useHabitStore();
  const { data: dash,  loading: l1 } = useStats('dashboard');
  const { data: week,  loading: l2 } = useStats('weekly');
  const { data: cats,  loading: l3 } = useStats('categories');
  const { data: bw,    loading: l4 } = useStats('bestWorst');
  const { data: mood,  loading: l5 } = useStats('moodCorrelation');

  const loading = l1 || l2 || l3 || l4 || l5;

  const weekRows = week?.breakdown ?? [];
  const weekLabels = weekRows.map((r) => {
    const d = new Date(r.date);
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  });
  const barData = weekRows.map((r, i) => ({ date: weekLabels[i] ?? r.date, completed: +r.completed }));

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div className="page">
      <Header title="Statistics" />
      <div style={{ padding: '0 20px' }}>

        {/* Summary grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { icon: '🔥', label: 'Avg Streak',  value: `${Math.round((dash?.total_streak ?? 0) / Math.max(habits.length, 1))}d`, color: 'var(--warning)' },
            { icon: '🏆', label: 'Best Streak', value: `${dash?.best_streak ?? 0}d`,      color: 'var(--gold)' },
            { icon: '📊', label: 'Week Rate',   value: `${dash?.week_rate ?? 0}%`,        color: 'var(--primary)' },
            { icon: '✅', label: 'This Month',  value: dash?.month_completed ?? 0,         color: 'var(--success)' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Weekly bar chart */}
        {barData.length > 0 && (
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Weekly Completions</div>
            <BarChart data={barData} labelKey="date" valueKey="completed" height={120} />
          </div>
        )}

        {/* Best + Worst */}
        {bw && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {/* Best */}
            <div className="card" style={{ padding: 14, borderTop: '3px solid var(--success)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 }}>🏅 Best</div>
              {bw.best?.slice(0, 3).map((h) => (
                <div key={h.habit_id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{h.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--success)' }}>{h.success_rate ?? 0}%</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Worst */}
            <div className="card" style={{ padding: 14, borderTop: '3px solid var(--danger)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 }}>⚠️ Needs Work</div>
              {bw.worst?.slice(0, 3).map((h) => (
                <div key={h.habit_id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{h.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--danger)' }}>{h.success_rate ?? 0}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category breakdown */}
        {cats?.categories?.length > 0 && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>By Category</div>
            {cats.categories.map((cat) => {
              const cfg = CATEGORIES.find((c) => c.id === cat.category);
              return (
                <div key={cat.category} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>{cfg?.icon} {cfg?.label ?? cat.category}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {cat.habit_count} habit{cat.habit_count !== 1 ? 's' : ''} · {cat.rate ?? 0}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <div className="progress-fill" style={{ width: `${cat.rate ?? 0}%`, background: cfg?.color ?? 'var(--primary)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mood correlation */}
        {mood?.correlation?.length > 0 && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Mood vs Habit Completion</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Average habits completed per mood</div>
            {mood.correlation.map((m) => {
              const moodEmojis = { happy: '😄', normal: '😐', sad: '😢', tired: '😴', stressed: '😤' };
              return (
                <div key={m.mood} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 22, width: 28 }}>{moodEmojis[m.mood]}</span>
                  <div style={{ flex: 1 }}>
                    <div className="progress-bar" style={{ height: 8 }}>
                      <div className="progress-fill" style={{ width: `${Math.min(+m.avg_completed * 20, 100)}%`, background: 'var(--primary)' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: 28, textAlign: 'right' }}>
                    {(+m.avg_completed).toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* AI insight */}
        <div className="card" style={{ padding: 20, marginBottom: 16, background: 'linear-gradient(135deg, #6C63FF11, #FF658411)', border: '1px solid #6C63FF33' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>🤖 AI Insight</div>
          <div style={{ fontSize: 15, lineHeight: 1.7 }}>
            {bw?.best?.[0]
              ? `You're most consistent with "${bw.best[0].name}" (${bw.best[0].success_rate ?? 0}% success rate). Keep that momentum going across all your habits!`
              : 'Complete more habits to unlock personalised AI insights.'}
          </div>
        </div>
      </div>
    </div>
  );
}
