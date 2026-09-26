const { pool } = require('../../src/config/db');

async function resetDatabase() {
  if (!pool) {
    console.error('❌ Error: DATABASE_URL is not configured. Set DATABASE_URL in .env before running reset.');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    console.log('[Reset] Resetting database tables...');
    await client.query('BEGIN');
    await client.query(`
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS incidents CASCADE;
      DROP TABLE IF EXISTS staff CASCADE;
      DROP TABLE IF EXISTS guests CASCADE;
      DROP TABLE IF EXISTS rooms CASCADE;
      DROP TABLE IF EXISTS resorts CASCADE;
    `);
    await client.query('COMMIT');
    console.log('✅ [Reset] All tables dropped safely.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [Reset] Reset failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();
