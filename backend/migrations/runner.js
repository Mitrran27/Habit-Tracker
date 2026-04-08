require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const MIGRATIONS_DIR = path.join(__dirname, 'files');

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id         SERIAL PRIMARY KEY,
      filename   VARCHAR(255) UNIQUE NOT NULL,
      run_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function getApplied(client) {
  const { rows } = await client.query('SELECT filename FROM migrations ORDER BY id');
  return rows.map((r) => r.filename);
}

async function up() {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const applied = await getApplied(client);
    const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
    const pending = files.filter((f) => !applied.includes(f));

    if (!pending.length) { console.log('✅  No pending migrations.'); return; }

    for (const file of pending) {
      console.log(`⬆️   Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`✅  ${file} applied.`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌  ${file} failed:`, err.message);
        process.exit(1);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

async function down() {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const applied = await getApplied(client);
    if (!applied.length) { console.log('Nothing to roll back.'); return; }

    const last = applied[applied.length - 1];
    const downFile = path.join(MIGRATIONS_DIR, last.replace('.sql', '.down.sql'));
    if (!fs.existsSync(downFile)) {
      console.error(`❌  No down migration found for ${last}`);
      process.exit(1);
    }
    console.log(`⬇️   Rolling back: ${last}`);
    const sql = fs.readFileSync(downFile, 'utf8');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('DELETE FROM migrations WHERE filename = $1', [last]);
    await client.query('COMMIT');
    console.log(`✅  ${last} rolled back.`);
  } finally {
    client.release();
    await pool.end();
  }
}

const command = process.argv[2];
if (command === 'up')   up().catch(console.error);
else if (command === 'down') down().catch(console.error);
else { console.log('Usage: node runner.js [up|down]'); process.exit(1); }
