const fs = require('fs');
const path = require('path');
const { pool } = require('../../src/config/db');

async function runMigrations() {
  if (!pool) {
    console.error('❌ Error: DATABASE_URL is not configured. Set DATABASE_URL in .env before running migrations.');
    process.exit(1);
  }

  console.log('[Migration] Connecting to PostgreSQL database...');
  const client = await pool.connect();

  try {
    const migrationPath = path.resolve(__dirname, '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('[Migration] Executing 001_initial_schema.sql...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✅ [Migration] PostgreSQL schema created successfully (resorts, rooms, guests, staff, incidents, tasks + indexes).');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [Migration] Schema migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
