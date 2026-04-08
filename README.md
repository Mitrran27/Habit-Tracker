# 🎯 HabitTracker — Full-Stack Mobile App

A production-grade habit tracking application built with React (frontend) and Node.js + Express + PostgreSQL (backend).

---

## 📁 Project Structure

```
habit-tracker/
├── backend/
│   ├── migrations/
│   │   ├── runner.js                    ← migration CLI runner
│   │   └── files/
│   │       ├── 001_create_users.sql
│   │       ├── 002_create_habits.sql
│   │       ├── 003_create_habit_logs.sql
│   │       ├── 004_create_streaks.sql
│   │       ├── 005_create_journal.sql
│   │       ├── 006_create_friends.sql
│   │       ├── 007_create_achievements.sql
│   │       ├── 008_create_templates_and_push.sql
│   │       ├── 009_create_views.sql
│   │       └── *.down.sql               ← rollback files
│   ├── seeds/
│   │   └── index.js                     ← demo data seeder
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                    ← PostgreSQL pool
│   │   │   └── jwt.js                   ← JWT sign/verify
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── habitController.js
│   │   │   ├── statsController.js
│   │   │   ├── journalController.js
│   │   │   ├── friendController.js
│   │   │   └── achievementController.js
│   │   ├── middleware/
│   │   │   ├── auth.js                  ← JWT guard
│   │   │   ├── validate.js              ← express-validator handler
│   │   │   ├── rateLimiter.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Habit.js
│   │   │   ├── HabitLog.js
│   │   │   ├── Streak.js
│   │   │   ├── Journal.js
│   │   │   ├── Friend.js
│   │   │   ├── Achievement.js
│   │   │   └── Stats.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── habits.js
│   │   │   ├── stats.js
│   │   │   ├── journal.js
│   │   │   ├── friends.js
│   │   │   ├── achievements.js
│   │   │   └── reminders.js
│   │   ├── services/
│   │   │   ├── emailService.js          ← Resend email wrapper
│   │   │   └── reminderService.js       ← cron reminder logic
│   │   └── utils/
│   │       ├── logger.js                ← Winston logger
│   │       ├── apiResponse.js           ← standard response helpers
│   │       └── dateHelpers.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Header.jsx
    │   │   │   ├── CircleProgress.jsx
    │   │   │   ├── Spinner.jsx
    │   │   │   ├── Toggle.jsx
    │   │   │   ├── EmptyState.jsx
    │   │   │   └── Toast.jsx
    │   │   ├── habits/
    │   │   │   ├── HabitCard.jsx
    │   │   │   ├── HabitForm.jsx
    │   │   │   └── HabitDetail.jsx
    │   │   ├── dashboard/
    │   │   │   ├── MoodPicker.jsx
    │   │   │   └── StatCard.jsx
    │   │   └── stats/
    │   │       └── BarChart.jsx
    │   ├── hooks/
    │   │   ├── useHabits.js
    │   │   └── useStats.js
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── HabitsPage.jsx
    │   │   ├── StatsPage.jsx
    │   │   ├── JournalPage.jsx
    │   │   └── SettingsPage.jsx
    │   ├── services/
    │   │   └── api.js                   ← Axios + all API calls
    │   ├── store/
    │   │   ├── authStore.js             ← Zustand auth store
    │   │   └── habitStore.js            ← Zustand habit store
    │   ├── styles/
    │   │   └── global.css
    │   ├── utils/
    │   │   ├── constants.js
    │   │   └── helpers.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd habit-tracker

# Backend
cd backend
npm install
cp .env.example .env      # fill in your values

# Frontend
cd ../frontend
npm install
```

### 2. Create the database

```bash
createdb habittracker
```

### 3. Run migrations

```bash
cd backend
node migrations/runner.js up
```

### 4. Seed demo data (optional)

```bash
node seeds/index.js
# Login: alex@example.com / password123
```

### 5. Start dev servers

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open `http://localhost:5173`

---

## 🔌 API Reference

| Method | Route                          | Auth | Description               |
|--------|-------------------------------|------|---------------------------|
| POST   | /api/auth/register            | ✗    | Register new user         |
| POST   | /api/auth/login               | ✗    | Login                     |
| GET    | /api/auth/me                  | ✓    | Get current user          |
| PATCH  | /api/auth/me                  | ✓    | Update profile            |
| POST   | /api/auth/forgot-password     | ✗    | Send reset email          |
| POST   | /api/auth/reset-password      | ✗    | Reset password            |
| GET    | /api/habits                   | ✓    | List habits               |
| POST   | /api/habits                   | ✓    | Create habit              |
| PATCH  | /api/habits/:id               | ✓    | Update habit              |
| DELETE | /api/habits/:id               | ✓    | Archive habit             |
| POST   | /api/habits/:id/checkin       | ✓    | Check in (complete/miss)  |
| DELETE | /api/habits/:id/checkin       | ✓    | Undo today's check-in     |
| GET    | /api/habits/:id/logs          | ✓    | Habit log history         |
| GET    | /api/habits/:id/calendar      | ✓    | Calendar data             |
| POST   | /api/habits/:id/freeze        | ✓    | Use streak freeze         |
| GET    | /api/stats/dashboard          | ✓    | Dashboard stats           |
| GET    | /api/stats/weekly             | ✓    | Weekly breakdown          |
| GET    | /api/stats/monthly            | ✓    | Monthly breakdown         |
| GET    | /api/stats/categories         | ✓    | Category breakdown        |
| GET    | /api/stats/mood-correlation   | ✓    | Mood vs completion        |
| GET    | /api/stats/best-worst         | ✓    | Best & worst habits       |
| GET    | /api/journal                  | ✓    | List journal entries      |
| POST   | /api/journal                  | ✓    | Create entry              |
| PATCH  | /api/journal/:id              | ✓    | Update entry              |
| DELETE | /api/journal/:id              | ✓    | Delete entry              |
| GET    | /api/friends                  | ✓    | Friend list               |
| POST   | /api/friends/request          | ✓    | Send friend request       |
| POST   | /api/friends/accept           | ✓    | Accept friend request     |
| GET    | /api/friends/leaderboard      | ✓    | Streak leaderboard        |
| GET    | /api/achievements             | ✓    | All achievements          |
| GET    | /api/achievements/earned      | ✓    | User's earned ones        |
| POST   | /api/reminders/send           | cron | Send due reminders        |

---

## 🌐 Deployment

### Render / Railway

**Backend:**
- Build: `npm install`
- Start: `node src/app.js`
- Add all `.env` vars in dashboard
- Run migrations: `node migrations/runner.js up`

**Frontend:**
- Build: `npm run build`
- Publish dir: `dist`
- Set `VITE_API_URL` to your backend URL

### Cron (reminders)
Set up a cron job that calls every minute:
```
POST https://your-api.com/api/reminders/send
Header: x-cron-secret: <your CRON_SECRET>
```
Use Railway Cron, Render Cron Jobs, or an external service like cron-job.org.

---

## 🛠 Tech Stack

| Layer     | Tech                                    |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Router v6, Zustand, Axios, Vite |
| Backend   | Node.js, Express.js, JWT, Helmet, Morgan |
| Database  | PostgreSQL 15                           |
| Email     | Resend                                  |
| Hosting   | Render / Railway                        |
