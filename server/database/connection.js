const mariadb = require('mariadb');

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.warn(`⚠️  Missing database environment variables: ${missingVars.join(', ')}`);
  console.warn('   Using default values - this may cause connection issues in production.');
}

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'magnetic_clouds',
  connectionLimit: 20,             // Increased from 10
  acquireTimeout: 30000,
  connectTimeout: 30000,
  idleTimeout: 60000,              // Close idle connections after 60s
  minimumIdle: 2,                  // Keep at least 2 connections ready
  resetAfterUse: true,             // Reset connection state after use
  leakDetectionTimeout: 60000      // Detect leaked connections
});

// Keep connections alive with a ping every 30 seconds
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    console.error('Database keep-alive ping failed:', error.message);
  }
}, 30000);

async function query(sql, params, retries = 2) {
  let conn;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      conn = await pool.getConnection();
      const result = await conn.query(sql, params);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Database query error (attempt ${attempt + 1}):`, error.code || error.message);

      // Add more context to database errors
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('❌ Database access denied. Check DB_USER and DB_PASSWORD in .env');
        throw error; // Don't retry auth errors
      } else if (error.code === 'ER_BAD_DB_ERROR') {
        console.error('❌ Database does not exist. Run migrations first.');
        throw error; // Don't retry DB errors
      } else if (error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST' ||
        error.code === 'ER_CON_COUNT_ERROR' || error.code === 'ETIMEDOUT') {
        // These errors can be retried
        if (attempt < retries) {
          console.log(`Retrying database query in ${(attempt + 1) * 500}ms...`);
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 500));
          continue;
        }
      }
      throw error;
    } finally {
      if (conn) {
        try {
          conn.release();
        } catch (e) {
          console.error('Error releasing connection:', e.message);
        }
      }
    }
  }
  throw lastError;
}

async function testConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function transaction(callback) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  pool,
  query,
  testConnection,
  transaction
};
