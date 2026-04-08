import { useState } from 'react';
import { CATEGORIES, HABIT_ICONS, COLOR_PALETTE, HABIT_TYPES } from '../../utils/constants';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const defaultForm = {
  name: '', icon: '💧', color: '#6C63FF',
  category: 'health', type: 'daily', difficulty: 'medium',
  target_days: 30, reminder_time: '08:00',
  why_reason: '', description: '',
};

export default function HabitForm({ onSave, onClose, initial }) {
  const [form, setForm] = useState({ ...defaultForm, ...initial });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const Label = ({ children }) => (
    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
      {children}
    </label>
  );

  return (
    <div>
      {/* Sheet handle */}
      <div className="modal-handle" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>{initial ? 'Edit Habit' : 'New Habit'}</span>
        <button className="btn-icon" onClick={onClose} style={{ fontSize: 16 }}>✕</button>
      </div>

      {/* Name */}
      <div style={{ marginBottom: 16 }}>
        <Label>Habit Name *</Label>
        <input
          className="input"
          placeholder="e.g. Drink Water"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </div>

      {/* Description */}
      <div style={{ marginBottom: 16 }}>
        <Label>Description (optional)</Label>
        <input
          className="input"
          placeholder="Describe this habit..."
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      {/* Icon picker */}
      <div style={{ marginBottom: 16 }}>
        <Label>Icon</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {HABIT_ICONS.map((icon) => (
            <button
              key={icon}
              onClick={() => set('icon', icon)}
              style={{
                width: 42, height: 42, borderRadius: 12, fontSize: 20, cursor: 'pointer',
                background: form.icon === icon ? '#6C63FF33' : 'var(--surface-2)',
                border: form.icon === icon ? '1.5px solid #6C63FF' : '1.5px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div style={{ marginBottom: 16 }}>
        <Label>Color</Label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLOR_PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => set('color', c)}
              style={{
                width: 34, height: 34, borderRadius: '50%', background: c, cursor: 'pointer',
                border: form.color === c ? '3px solid white' : '2px solid transparent',
                transition: 'all 0.15s', flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Type + Difficulty */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <Label>Type</Label>
          <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
            {HABIT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <Label>Difficulty</Label>
          <select className="input" value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category */}
      <div style={{ marginBottom: 16 }}>
        <Label>Category</Label>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => set('category', cat.id)}
              className="chip"
              style={{
                background: form.category === cat.id ? cat.color + '22' : 'transparent',
                borderColor: form.category === cat.id ? cat.color : 'var(--border)',
                color: form.category === cat.id ? cat.color : 'var(--text-muted)',
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target + Reminder */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <Label>Target Days</Label>
          <input
            className="input" type="number" min={1} max={365}
            value={form.target_days}
            onChange={(e) => set('target_days', +e.target.value)}
          />
        </div>
        <div>
          <Label>Reminder Time</Label>
          <input
            className="input" type="time"
            value={form.reminder_time}
            onChange={(e) => set('reminder_time', e.target.value)}
          />
        </div>
      </div>

      {/* Why reason */}
      <div style={{ marginBottom: 24 }}>
        <Label>Why are you doing this? ✨</Label>
        <textarea
          className="input"
          rows={3}
          placeholder="Your reason will appear when you're about to miss this habit..."
          value={form.why_reason}
          onChange={(e) => set('why_reason', e.target.value)}
          style={{ resize: 'none' }}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={!form.name.trim() || saving}
      >
        {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Habit 🚀'}
      </button>
    </div>
  );
}
