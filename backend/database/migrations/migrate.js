const fs = require('fs');
const path = require('path');
const { pool } = require('../../src/config/db');

const MIGRATIONS = [
  '001_initial_schema.sql',
  '002_ai_persistence.sql',
];

async function runMigrations() {
  if (!pool) {
    console.error('❌ Error: DATABASE_URL is not configured. Set DATABASE_URL in .env before running migrations.');
    process.exit(1);
  }

  console.log('[Migration] Connecting to PostgreSQL database...');
  const client = await pool.connect();

  try {
    for (const migrationFile of MIGRATIONS) {
      const migrationPath = path.resolve(__dirname, migrationFile);
      if (!fs.existsSync(migrationPath)) {
        console.warn(`[Migration] File not found, skipping: ${migrationFile}`);
        continue;
      }
      const sql = fs.readFileSync(migrationPath, 'utf8');
      console.log(`[Migration] Executing ${migrationFile}...`);
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`✅ [Migration] ${migrationFile} applied successfully.`);
    }
    console.log('✅ [Migration] All migrations complete.');
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
