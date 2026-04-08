import { useState, useEffect } from 'react';
import CircleProgress from '../components/common/CircleProgress';
import MoodPicker from '../components/dashboard/MoodPicker';
import StatCard from '../components/dashboard/StatCard';
import HabitCard from '../components/habits/HabitCard';
import EmptyState from '../components/common/EmptyState';
import useHabitStore from '../store/habitStore';
import useAuthStore from '../store/authStore';
import { statsAPI } from '../services/api';
import { getGreeting, pct } from '../utils/helpers';

export default function DashboardPage({ onHabitPress, onAddHabit }) {
  const { habits, checkIn, undoCheckIn } = useHabitStore();
  const { user } = useAuthStore();
  const [mood, setMood] = useState(null);
  const [dashStats, setDashStats] = useState(null);

  const today = new Date().toLocaleDateString('en-MY', { weekday: 'long', month: 'short', day: 'numeric' });

  useEffect(() => {
    statsAPI.dashboard().then(({ data }) => setDashStats(data.data)).catch(() => {});
  }, [habits]);

  const completed = habits.filter((h) => h.completed_today).length;
  const total     = habits.length;
  const todayPct  = pct(completed, total);

  const handleToggle = async (id, toComplete) => {
    if (toComplete) await checkIn(id, { status: 'completed', mood });
    else            await undoCheckIn(id);
  };

  return (
    <div className="page">
      <div style={{ padding: '20px 20px 0' }}>

        {/* Date + greeting */}
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 2 }}>{today}</div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginBottom: 20 }}>
          {getGreeting()}{user ? `, ${user.name.split(' ')[0]}` : ''} 👋
        </div>

        {/* Progress hero card */}
        <div className="card" style={{
          padding: 20, marginBottom: 16,
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Today's progress</div>
              <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1, color: todayPct === 100 ? 'var(--success)' : 'var(--text)' }}>
                {completed}
                <span style={{ fontSize: 20, color: 'var(--text-muted)', fontWeight: 400 }}>/{total}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>habits completed</div>
            </div>
            <CircleProgress value={todayPct} size={90} stroke={7} color={todayPct === 100 ? '#43D9A2' : '#6C63FF'}>
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)', color: todayPct === 100 ? '#43D9A2' : 'var(--text)' }}>
                {todayPct}%
              </span>
            </CircleProgress>
          </div>
        </div>

        {/* Stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <StatCard icon="🔥" label="Total Streak"  value={`${dashStats?.total_streak ?? '—'}d`}  color="var(--warning)" />
          <StatCard icon="🏆" label="Best Streak"   value={`${dashStats?.best_streak ?? '—'}d`}   color="var(--gold)" />
          <StatCard icon="📋" label="Total Habits"  value={dashStats?.total_habits ?? total}      color="var(--primary)" />
          <StatCard icon="📊" label="Week Rate"     value={`${dashStats?.week_rate ?? 0}%`}       color="var(--success)" />
        </div>

        {/* Mood picker */}
        <div style={{ marginBottom: 24 }}>
          <MoodPicker selected={mood} onChange={setMood} />
        </div>

        {/* Today's habits */}
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Today's Habits
        </div>

        {habits.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="No habits yet"
            subtitle="Add your first habit to start building your routine"
            action="Add Habit"
            onAction={onAddHabit}
          />
        ) : (
          habits.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              onToggle={handleToggle}
              onPress={() => onHabitPress(h)}
            />
          ))
        )}
      </div>
    </div>
  );
}
