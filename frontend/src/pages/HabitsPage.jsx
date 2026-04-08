import { useState } from 'react';
import Header from '../components/common/Header';
import HabitCard from '../components/habits/HabitCard';
import EmptyState from '../components/common/EmptyState';
import useHabitStore from '../store/habitStore';
import { CATEGORIES } from '../utils/constants';

export default function HabitsPage({ onHabitPress, onAddHabit }) {
  const { habits, checkIn, undoCheckIn } = useHabitStore();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? habits : habits.filter((h) => h.category === filter);

  const handleToggle = async (id, toComplete) => {
    if (toComplete) await checkIn(id, { status: 'completed' });
    else            await undoCheckIn(id);
  };

  return (
    <div className="page">
      <Header
        title="My Habits"
        right={
          <button
            onClick={onAddHabit}
            style={{ background: 'var(--primary)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: 12, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            +
          </button>
        }
      />

      {/* Category filter */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <button
            className="chip"
            onClick={() => setFilter('all')}
            style={{
              background: filter === 'all' ? 'var(--primary)' : 'transparent',
              borderColor: filter === 'all' ? 'var(--primary)' : 'var(--border)',
              color: filter === 'all' ? 'white' : 'var(--text-muted)',
            }}
          >
            All ({habits.length})
          </button>
          {CATEGORIES.filter((cat) => habits.some((h) => h.category === cat.id)).map((cat) => (
            <button
              key={cat.id}
              className="chip"
              onClick={() => setFilter(cat.id)}
              style={{
                background: filter === cat.id ? cat.color + '33' : 'transparent',
                borderColor: filter === cat.id ? cat.color : 'var(--border)',
                color: filter === cat.id ? cat.color : 'var(--text-muted)',
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Habit list */}
      <div style={{ padding: '0 20px' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="🌟"
            title={filter === 'all' ? 'No habits yet' : `No ${filter} habits`}
            subtitle="Start building your routine"
            action="Add Habit"
            onAction={onAddHabit}
          />
        ) : (
          filtered.map((h) => (
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
