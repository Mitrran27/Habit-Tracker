import { CATEGORIES, DIFFICULTY_CONFIG } from './constants';

export const getCategoryConfig = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export const getDifficultyConfig = (level) =>
  DIFFICULTY_CONFIG[level] || DIFFICULTY_CONFIG.medium;

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = +h;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
};

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export const pct = (val, max) =>
  max > 0 ? Math.round(clamp((val / max) * 100, 0, 100)) : 0;

export const pluralise = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export const todayISO = () => new Date().toISOString().split('T')[0];
