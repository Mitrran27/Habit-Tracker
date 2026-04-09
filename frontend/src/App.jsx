import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import useAuthStore  from './store/authStore';
import useHabitStore from './store/habitStore';

import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HabitsPage    from './pages/HabitsPage';
import StatsPage     from './pages/StatsPage';
import JournalPage   from './pages/JournalPage';
import SettingsPage  from './pages/SettingsPage';
import SocialPage    from './pages/SocialPage';

import HabitDetail from './components/habits/HabitDetail';
import HabitForm   from './components/habits/HabitForm';
import ToastProvider from './components/common/Toast';

// ── Tab bar ───────────────────────────────────────────────────
const TABS = [
  { id: 'home',    icon: '🏠', label: 'Home'    },
  { id: 'habits',  icon: '✅', label: 'Habits'  },
  { id: 'stats',   icon: '📊', label: 'Stats'   },
  { id: 'social',  icon: '👥', label: 'Social'  },
  { id: 'journal', icon: '📝', label: 'Journal' },
];

// ── Protected shell ───────────────────────────────────────────
function AppShell() {
  const [tab,           setTab]           = useState('home');
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showForm,      setShowForm]      = useState(false);
  const [editHabit,     setEditHabit]     = useState(null);
  const [showSettings,  setShowSettings]  = useState(false);

  const { fetchHabits, createHabit, updateHabit, archiveHabit, checkIn, undoCheckIn } = useHabitStore();

  useEffect(() => { fetchHabits(); }, []);

  const openAdd  = () => { setEditHabit(null); setShowForm(true); };
  const openEdit = (h) => { setEditHabit(h); setShowForm(true); setSelectedHabit(null); };

  const handleSaveForm = async (form) => {
    if (editHabit) await updateHabit(editHabit.id, form);
    else           await createHabit(form);
    setShowForm(false);
    setEditHabit(null);
  };

  const handleDelete = async (id) => {
    await archiveHabit(id);
    setSelectedHabit(null);
  };

  const handleToggle = async (id, toComplete) => {
    if (toComplete) await checkIn(id, { status: 'completed' });
    else            await undoCheckIn(id);
    if (selectedHabit?.id === id) {
      setSelectedHabit((h) => h ? { ...h, completed_today: toComplete } : h);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setSelectedHabit(null);
    setShowSettings(false);
  };

  // ── Page renderer ─────────────────────────────────────────
  const renderPage = () => {
    if (showSettings) return <SettingsPage onBack={() => setShowSettings(false)} />;
    switch (tab) {
      case 'stats':   return <StatsPage />;
      case 'journal': return <JournalPage />;
      case 'social':  return <SocialPage />;
      case 'habits':  return <HabitsPage onHabitPress={setSelectedHabit} onAddHabit={openAdd} />;
      default:        return <DashboardPage onHabitPress={setSelectedHabit} onAddHabit={openAdd} />;
    }
  };

  // SocialPage manages its own full-screen sub-views (chat, friend profile)
  // so we must not show the tab bar while those are active.
  // SocialPage handles that internally by rendering full-screen overlays.

  return (
    <div className="app-shell">
      <ToastProvider />

      {/* Habit detail overlay */}
      {selectedHabit && !showForm && (
        <div
          className="fade-in"
          style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'var(--bg)', overflowY: 'auto', paddingBottom: 88 }}
        >
          <HabitDetail
            habit={selectedHabit}
            onClose={() => setSelectedHabit(null)}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        </div>
      )}

      {/* Main page */}
      {!selectedHabit && renderPage()}

      {/* Habit form modal */}
      {showForm && (
        <div className="modal-overlay fade-in" onClick={() => setShowForm(false)}>
          <div className="modal-sheet slide-up" onClick={(e) => e.stopPropagation()}>
            <HabitForm
              initial={editHabit}
              onSave={handleSaveForm}
              onClose={() => { setShowForm(false); setEditHabit(null); }}
            />
          </div>
        </div>
      )}

      {/* Tab bar — hidden when viewing a habit detail, form open, or settings */}
      {!selectedHabit && !showForm && !showSettings && (
        <nav className="tab-bar">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id && !showSettings ? 'active' : ''}`}
              onClick={() => switchTab(t.id)}
            >
              <span className="tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
          <button
            className={`tab-btn ${showSettings ? 'active' : ''}`}
            onClick={() => { setShowSettings(true); setSelectedHabit(null); }}
          >
            <span className="tab-icon">⚙️</span>
            Settings
          </button>
        </nav>
      )}
    </div>
  );
}

// ── Auth guard ────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { token, fetchMe } = useAuthStore();
  useEffect(() => { fetchMe(); }, []);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// ── Root ──────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
