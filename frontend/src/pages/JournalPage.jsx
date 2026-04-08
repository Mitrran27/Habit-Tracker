import { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import EmptyState from '../components/common/EmptyState';
import { journalAPI } from '../services/api';
import { MOODS } from '../utils/constants';
import { showToast } from '../components/common/Toast';

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [text, setText]       = useState('');
  const [mood, setMood]       = useState(null);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    journalAPI.list().then(({ data }) => setEntries(data.data.entries)).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const { data } = await journalAPI.create({ content: text.trim(), mood });
      setEntries((e) => [data.data.entry, ...e]);
      setText('');
      setMood(null);
      showToast('Reflection saved ✨', 'success');
    } catch {
      showToast('Failed to save', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await journalAPI.delete(id);
      setEntries((e) => e.filter((x) => x.id !== id));
      showToast('Entry deleted', 'info');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-MY', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="page">
      <Header title="Journal" />
      <div style={{ padding: '0 20px' }}>

        {/* Write entry */}
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <textarea
            className="input"
            rows={4}
            placeholder="Write your daily reflection..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ background: 'transparent', border: 'none', padding: 0, resize: 'none', marginBottom: 12 }}
          />

          {/* Mood row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMood(mood === m.id ? null : m.id)}
                style={{
                  fontSize: 22, padding: '4px 6px', borderRadius: 10, cursor: 'pointer',
                  background: mood === m.id ? '#6C63FF22' : 'transparent',
                  border: mood === m.id ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                  transition: 'all 0.2s',
                }}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!text.trim() || saving}
            style={{ fontSize: 14, padding: '10px' }}
          >
            {saving ? 'Saving...' : 'Save Reflection ✨'}
          </button>
        </div>

        {/* Entry list */}
        {entries.length === 0 ? (
          <EmptyState icon="📝" title="No reflections yet" subtitle="Start your daily reflection journey" />
        ) : (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Past Reflections
            </div>
            {entries.map((e) => {
              const moodCfg = MOODS.find((m) => m.id === e.mood);
              return (
                <div key={e.id} className="card" style={{ padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {formatDate(e.date || e.created_at)}
                      </span>
                      {moodCfg && <span style={{ fontSize: 16 }}>{moodCfg.emoji}</span>}
                    </div>
                    <button
                      onClick={() => handleDelete(e.id)}
                      style={{ color: 'var(--text-dim)', fontSize: 16, cursor: 'pointer', background: 'none', border: 'none', padding: '0 2px' }}
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)' }}>{e.content}</div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
