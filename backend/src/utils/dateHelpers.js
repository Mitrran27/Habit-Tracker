const today = () => new Date().toISOString().split('T')[0];

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const daysBetween = (a, b) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((new Date(b) - new Date(a)) / msPerDay);
};

const startOfWeek = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1); // Monday
  return d.toISOString().split('T')[0];
};

const startOfMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

module.exports = { today, daysAgo, daysBetween, startOfWeek, startOfMonth };
