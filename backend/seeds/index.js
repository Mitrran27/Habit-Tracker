require('dotenv').config();
const { pool } = require('../src/config/db');
const bcrypt   = require('bcryptjs');

async function seed() {
  const client = await pool.connect();
  console.log('🌱 Seeding database...');

  try {
    await client.query('BEGIN');

    // ── Users ─────────────────────────────────────────────────
    const pw = await bcrypt.hash('password123', 12);
    const { rows: users } = await client.query(`
      INSERT INTO users (name, email, password_hash, timezone)
      VALUES
        ('Alex Johnson',  'alex@example.com',  $1, 'Asia/Kuala_Lumpur'),
        ('Sara Lee',      'sara@example.com',  $1, 'Asia/Kuala_Lumpur'),
        ('Mike Tan',      'mike@example.com',  $1, 'Asia/Singapore')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, email
    `, [pw]);
    console.log(`  ✅ ${users.length} users`);

    const [alex, sara, mike] = users;

    // ── Habits for Alex ───────────────────────────────────────
    const { rows: habits } = await client.query(`
      INSERT INTO habits
        (user_id, name, description, type, category, difficulty,
         reminder_time, target_days, color, icon, why_reason)
      VALUES
        ($1,'Drink Water',   'Stay hydrated throughout the day',       'daily','health',     'easy',  '08:00',30,'#60A5FA','💧','Feel energised and focused all day'),
        ($1,'Morning Run',   '5km run before breakfast',               'daily','fitness',    'hard',  '06:30',60,'#43D9A2','🏃','Build endurance and mental toughness'),
        ($1,'Read 20 min',   'Non-fiction or technical books',         'daily','study',      'medium','21:00',30,'#A78BFA','📚','Expand knowledge every single day'),
        ($1,'Meditate',      '10-minute mindfulness session',          'daily','mental',     'medium','07:00',30,'#F472B6','🧘','Find calm and clarity in the chaos'),
        ($1,'No Sugar',      'Avoid added sugar in food and drinks',   'daily','health',     'hard',  '09:00',30,'#FF6B6B','🚭','Break the addiction and feel lighter'),
        ($1,'Study DSA',     '2h of data structures & algorithms',     'daily','study',      'hard',  '19:00',90,'#6C63FF','💻','Land a top tech job this year'),
        ($1,'Gratitude Log', 'Write 3 things you''re grateful for',   'daily','mental',     'easy',  '22:00',30,'#34D399','📝','Rewire my brain toward positivity')
      RETURNING id
    `, [alex.id]);
    console.log(`  ✅ ${habits.length} habits for Alex`);

    // ── Streaks for Alex's habits ─────────────────────────────
    const streakValues = [7, 3, 12, 5, 1, 21, 8];
    for (let i = 0; i < habits.length; i++) {
      const best = Math.max(streakValues[i], streakValues[i] + Math.floor(Math.random() * 10));
      await client.query(`
        INSERT INTO streaks (habit_id, current_streak, best_streak, last_check_in)
        VALUES ($1, $2, $3, CURRENT_DATE)
        ON CONFLICT (habit_id) DO UPDATE
          SET current_streak = EXCLUDED.current_streak,
              best_streak    = EXCLUDED.best_streak
      `, [habits[i].id, streakValues[i], best]);
    }
    console.log(`  ✅ Streaks seeded`);

    // ── Habit logs (last 14 days) for Alex ───────────────────
    for (const habit of habits) {
      for (let d = 0; d < 14; d++) {
        const rand = Math.random();
        const status = rand > 0.25 ? 'completed' : rand > 0.1 ? 'missed' : 'skipped';
        const moods = ['happy', 'normal', 'sad', 'tired', 'stressed'];
        const mood  = moods[Math.floor(Math.random() * moods.length)];
        await client.query(`
          INSERT INTO habit_logs (habit_id, date, status, mood)
          VALUES ($1, CURRENT_DATE - ($2 * INTERVAL '1 day'), $3, $4)
          ON CONFLICT (habit_id, date) DO NOTHING
        `, [habit.id, d, status, mood]);
      }
    }
    console.log(`  ✅ Habit logs (14 days) seeded`);

    // ── Journal entries for Alex ──────────────────────────────
    const journalEntries = [
      { content: 'Had a great morning run today. Feeling energised and ready to tackle the day!', mood: 'happy',  daysAgo: 0 },
      { content: 'Struggled with meditation but pushed through. The last 3 minutes finally clicked.', mood: 'normal', daysAgo: 1 },
      { content: 'Missed my evening study session due to work overtime. Need to protect that time block.', mood: 'tired',  daysAgo: 2 },
      { content: 'Week 3 complete! My energy levels are noticeably higher since cutting sugar.', mood: 'happy',  daysAgo: 3 },
      { content: 'Feeling a bit stressed today. The gratitude log really helped shift my perspective.', mood: 'stressed', daysAgo: 5 },
    ];
    for (const e of journalEntries) {
      await client.query(`
        INSERT INTO journal_entries (user_id, content, mood, date)
        VALUES ($1, $2, $3, CURRENT_DATE - ($4 * INTERVAL '1 day'))
      `, [alex.id, e.content, e.mood, e.daysAgo]);
    }
    console.log(`  ✅ Journal entries seeded`);

    // ── Friendship: Alex ↔ Sara ───────────────────────────────
    await client.query(`
      INSERT INTO friends (user_id, friend_id, status)
      VALUES ($1, $2, 'accepted'), ($2, $3, 'accepted')
      ON CONFLICT DO NOTHING
    `, [alex.id, sara.id, mike.id]);

    // Sara's habit + streak (for leaderboard)
    const { rows: saraHabits } = await client.query(`
      INSERT INTO habits (user_id, name, type, category, difficulty, target_days, color, icon)
      VALUES ($1, 'Yoga', 'daily', 'fitness', 'medium', 30, '#F472B6', '🧘')
      RETURNING id
    `, [sara.id]);
    await client.query(`
      INSERT INTO streaks (habit_id, current_streak, best_streak)
      VALUES ($1, 15, 22) ON CONFLICT DO NOTHING
    `, [saraHabits[0].id]);

    console.log(`  ✅ Friends & Sara's data seeded`);

    // ── Award some achievements to Alex ───────────────────────
    await client.query(`
      INSERT INTO user_achievements (user_id, achievement_id)
      SELECT $1, id FROM achievements WHERE code IN ('first_habit','streak_7')
      ON CONFLICT DO NOTHING
    `, [alex.id]);
    console.log(`  ✅ Achievements seeded`);

    await client.query('COMMIT');
    console.log('\n🎉 Seeding complete!');
    console.log('   Login: alex@example.com / password123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
