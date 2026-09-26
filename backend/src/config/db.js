const { Pool } = require('pg');
const config = require('./index');

let pool = null;
let isConnected = false;

if (config.databaseUrl) {
  try {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });

    pool.on('error', (err) => {
      console.warn('[PostgreSQL Pool Warning]', err.message);
      isConnected = false;
    });
  } catch (err) {
    console.warn('[PostgreSQL Pool Init Warning]', err.message);
  }
}

async function checkDatabaseHealth() {
  if (!pool) {
    return { connected: false, message: 'DATABASE_URL not configured' };
  }
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      isConnected = true;
      return { connected: true };
    } finally {
      client.release();
    }
  } catch (error) {
    isConnected = false;
    return { connected: false, error: error.message };
  }
}

module.exports = {
  pool,
  query: (text, params) => (pool ? pool.query(text, params) : Promise.reject(new Error('No DB pool configured'))),
  checkDatabaseHealth,
  isDbConnected: () => isConnected,
};
