const { Pool } = require('pg');
const config = require('./index');

let pool = null;
let isConnected = false;

function determineSslConfig() {
  if (process.env.DATABASE_SSL === 'false') {
    return false;
  }
  if (process.env.DATABASE_SSL === 'true') {
    return { rejectUnauthorized: false };
  }
  const url = config.databaseUrl || '';
  if (
    url.includes('render.com') ||
    url.includes('supabase.co') ||
    url.includes('neon.tech') ||
    url.includes('sslmode=require') ||
    (config.nodeEnv === 'production' && !url.includes('localhost') && !url.includes('127.0.0.1'))
  ) {
    return { rejectUnauthorized: false };
  }
  return false;
}

if (config.databaseUrl) {
  try {
    const sslConfig = determineSslConfig();
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: sslConfig,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.warn('[DATABASE] PostgreSQL pool error:', err.message);
      isConnected = false;
    });

    console.log(`[DATABASE] Pool configured (SSL: ${Boolean(sslConfig)})`);
  } catch (err) {
    console.warn('[DATABASE] Pool initialization warning:', err.message);
  }
} else {
  console.log('[DATABASE] DATABASE_URL not set — using in-memory operational store');
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
